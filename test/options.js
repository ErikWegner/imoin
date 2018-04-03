describe('options html', () => {
  const getFormTextValueStub = sinon.stub(window, 'getFormTextValue');
  const getCheckboxValueStub = sinon.stub(window, 'getCheckboxValue');
  const setCheckboxValueStub = sinon.stub(window, 'setCheckboxValue');
  const documentQuerySelectorStub = sinon.stub(document, 'querySelector');
  const documentGetElementByIdStub = sinon.stub(document, 'getElementById');
  const saveOptionsSpy = sinon.spy(window, 'saveOptions');
  const updateDOMforFiltersSpy = sinon.spy(window, 'updateDOMforFilters');
  const documentGetElementsByClassNameStub = sinon.stub(document, 'getElementsByClassName');

  beforeEach(() => {
    // Re-Init global variables
    instances = [];
    selectedInstance = -1;
    // Stub browser interactions
    updateDOMforInstances = sinon.spy();
    // Reset all spies and stubs
    saveOptionsSpy.reset();
    updateDOMforFiltersSpy.reset();
    getFormTextValueStub.reset();
    getCheckboxValueStub.reset();
    setCheckboxValueStub.reset();
    documentQuerySelectorStub.reset();
    documentGetElementsByClassNameStub.reset();
    documentGetElementByIdStub.withArgs('fontsize').returns({ value: "100" });
    loadOptions = sinon.stub().resolves({ instance: createInstance('Unit test default') });
    port = {
      postMessage: sinon.spy(),
      disconnect: sinon.spy()
    }
    host = {
      storage: {
        local: {
          set: sinon.spy()
        }
      },
      runtime: {
        connect: function () {
          return port;
        }
      }
    };
  });

  it('should add instance', () => {
    const l = instances.length;
    addInstance();
    expect(instances.length).toBe(l + 1);
    expect(selectedInstance).toBe(l);
    expect(updateDOMforInstances.calledOnce).toBe(true);
  });

  it('should add three instances', () => {
    const l = instances.length;
    addInstance();
    addInstance();
    addInstance();
    expect(instances.length).toBe(l + 3);
    expect(selectedInstance).toBe(2);
    expect(updateDOMforInstances.calledThrice).toBe(true);
  });

  it('should update instance', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    // select instance 2
    selectedInstance = 1;

    let callCounter = 0;
    getFormTextValueStub.callsFake((selector, defaultValue) => {
      callCounter++;
      if ('#timerPeriod' === selector) {
        return '17'
      }
      return "Call " + selector;
    });
    updateInstance();

    const probe = instances[selectedInstance];
    expect(probe.instancelabel).toBe('Call #instancelabel');
    expect(probe.timerPeriod).toBe(17);
    expect(probe.icingaversion).toBe('Call #icingaversion');
    expect(probe.url).toBe('Call #url');
    expect(probe.username).toBe('Call #username');
    expect(probe.password).toBe('Call #password');
  });

  it('should not remove last instance', () => {
    const l1 = instances.length;
    addInstance();
    const l2 = instances.length;
    updateDOMforInstances.reset(); // addInstance will call updateDOM
    removeInstance();
    const l3 = instances.length;

    expect(l1).toBe(0); // no instance when the test starts
    expect(l2).toBe(1); // one instance added
    expect(l3).toBe(1); // still one instance available

    expect(updateDOMforInstances.notCalled).toBe(true);
  });

  it('should remove selected instance', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    // select instance 2
    selectedInstance = 1;
    const removedInstance = instances[selectedInstance];

    updateDOMforInstances.reset(); // addInstance will call updateDOM
    removeInstance();
    expect(instances.indexOf(removedInstance)).toBe(-1);
    expect(updateDOMforInstances.calledOnce).toBe(true);
  });

  it('should remove last instance and update selectedInstance', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    // select instance 2
    const l1 = selectedInstance;
    const removedInstance = instances[selectedInstance];

    updateDOMforInstances.reset(); // addInstance will call updateDOM
    removeInstance();
    expect(instances.indexOf(removedInstance)).toBe(-1);
    expect(l1).toBe(3);
    expect(selectedInstance).toBe(2);
  });

  it('should restore options and update DOM', (done) => {
    restoreOptions().then(() => {
      expect(updateDOMforInstances.calledOnce).toBe(true);
      done();
    });
  });

  it('should restore with null argument', (done) => {
    loadOptions = sinon.stub().resolves(null);
    restoreOptions().then(() => {
      expect(selectedInstance).toBe(0);
      expect(instances.length).toBe(1);
      expect(instances[0].instancelabel).toBe('Default');
      done();
    });
  });

  it('should restore with null value', (done) => {
    loadOptions = sinon.stub().resolves({ instances: null });
    restoreOptions().then(() => {
      expect(selectedInstance).toBe(0);
      expect(instances.length).toBe(1);
      expect(instances[0].instancelabel).toBe('Default');
      done();
    });
  });

  it('should restore with empty storage', (done) => {
    loadOptions = sinon.stub().resolves({ instances: '[]' });
    restoreOptions().then(() => {
      expect(selectedInstance).toBe(0);
      expect(instances.length).toBe(1);
      expect(instances[0].instancelabel).toBe('Default');
      done();
    });
  });

  it('should restore with filled storage', (done) => {
    const r = [createInstance('should restore with filled storage instance')];
    loadOptions = sinon.stub().resolves({ instances: JSON.stringify(r) });
    restoreOptions().then(() => {
      expect(selectedInstance).toBe(0);
      expect(instances.length).toBe(1);
      expect(instances[0].instancelabel).toBe('should restore with filled storage instance');
      done();
    });
  });

  it('should restore 4 instances', (done) => {
    loadOptions = sinon.stub().resolves({ instances: '[{"instancelabel":"Instance 0","timerPeriod":5,"icingaversion":"cgi","url":"","username":"","password":""},{"instancelabel":"Instance 1","timerPeriod":5,"icingaversion":"cgi","url":"","username":"","password":""},{"instancelabel":"Instance 2","timerPeriod":5,"icingaversion":"cgi","url":"","username":"","password":""},{"instancelabel":"Instance 3","timerPeriod":5,"icingaversion":"cgi","url":"","username":"","password":""}]' });
    restoreOptions().then(() => {
      expect(selectedInstance).toBe(0);
      expect(instances.length).toBe(4);
      expect(instances[2].instancelabel).toBe('Instance 2');
      done();
    });
  });

  it('should save instances object', () => {
    const setSpy = host.storage.local.set;
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    saveOptions();
    expect(setSpy.callCount).toBe(1);
    const arg = setSpy.args[0];
    expect(arg[0].instances).toBe(JSON.stringify(instances));
  });

  it('should save filterOutAcknowledged value', () => {
    const setSpy = host.storage.local.set;
    addInstance();
    getCheckboxValueStub.withArgs('#filterOutAcknowledged').returns(1);

    saveOptions();

    expect(setSpy.callCount).toBe(1);
    expect(getCheckboxValueStub.called).toBe(true);
    expect(getCheckboxValueStub.args[0][0]).toBe('#filterOutAcknowledged');
    const arg = setSpy.args[0];
    const i = JSON.parse(arg[0].instances);
    expect(i.length).toBe(1);
    expect(i[0].filtersettings).toBeDefined();
    expect(i[0].filtersettings.filterOutAcknowledged).toBe(true);
  });

  it('should restore options and update DOM for filters', (done) => {
    restoreOptions().then(() => {
      expect(updateDOMforFilters.calledOnce).toBe(true);
      done();
    });
  });

  it('should set filterOutAcknowledged checkbox when updating DOM for filters', () => {
    const a0 = setCheckboxValueStub.callCount;
    
    updateDOMforFilters();
    
    expect(a0).toBe(0);
    expect(setCheckboxValueStub.callCount).toBe(1);
    expect(setCheckboxValueStub.args[0][0]).toBe('#filterOutAcknowledged');
  });

  /**
   * getFormTextValue uses _selector_ to find the element
   */
  it('should get form text value', () => {
    const selector = '#jfdsalkfds98';
    getFormTextValueStub.callThrough();
    documentQuerySelectorStub.onFirstCall().returns('p');
    getFormTextValue(selector, 'k');

    expect(documentQuerySelectorStub.callCount).toBe(1);
    expect(documentQuerySelectorStub.args[0][0]).toBe(selector);
  });

  /**
   * getFormTextValue returns value
   */
  it('should get form text value', () => {
    const selector = '#jfdsalkfds98';
    getFormTextValueStub.callThrough();
    documentQuerySelectorStub.onFirstCall().returns({ value: null });
    const result = getFormTextValue(selector, 'k');

    expect(documentQuerySelectorStub.callCount).toBe(1);
    expect(result).toBe('k');
  });

  it('should get 1 (true) value for checked checkbox', () => {
    const selector = '#box1';
    getCheckboxValueStub.callThrough();
    documentQuerySelectorStub.onFirstCall().returns({ checked: true });

    const result = getCheckboxValue(selector, 5);

    expect(result).toBe(1);
  });

  it('should get 0 (false) value for unchecked checkbox', () => {
    const selector = '#box1';
    getCheckboxValueStub.callThrough();
    documentQuerySelectorStub.onFirstCall().returns({ checked: false });

    const result = getCheckboxValue(selector, 8);

    expect(result).toBe(0);
  });

  it('should get default value for not existing checkbox', () => {
    const selector = '#box1';
    getCheckboxValueStub.callThrough();
    documentQuerySelectorStub.onFirstCall().returns(null);

    const result = getCheckboxValue(selector, 7);

    expect(result).toBe(7);
  });

  it('should update selected instance', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    const sel1 = selectedInstance;
    selectionChanged({ target: { value: '2' } });
    const sel2 = selectedInstance;

    // last added instance is selected
    expect(sel1).toBe(3);
    // selected instance has changed
    expect(sel2).toBe(2);
  });

  it('should update dom after selected instance changes', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    const dc1 = updateDOMforInstances.callCount;
    selectionChanged({ target: { value: '2' } });
    const dc2 = updateDOMforInstances.callCount;

    // adding an instance calls updateDOM
    expect(dc1).toBe(4);
    // changing selected instance triggers updateDOM
    expect(dc2).toBe(5);
  });

  it('should update instance on saving options', () => {
    const setSpy = host.storage.local.set;
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    // select instance 2
    selectedInstance = 1;

    getFormTextValueStub.callsFake((selector, defaultValue) => {
      if ('#timerPeriod' === selector) {
        return '17'
      }
      return "Call " + selector;
    });

    updateSettings();

    expect(setSpy.callCount).toBe(1);
    const arg = setSpy.args[0];
    const emptyFiltersettings = {
      filterOutAcknowledged: false
    };
    expect(arg[0].instances).toBe(JSON.stringify(
      [
        {
          "instancelabel": "Instance 0",
          "timerPeriod": 5,
          "icingaversion": "cgi",
          "url": "",
          "username": "",
          "password": "",
          filtersettings: emptyFiltersettings
        }, {
          "instancelabel": "Call #instancelabel",
          "timerPeriod": 17,
          "icingaversion": "Call #icingaversion",
          "url": "Call #url",
          "username": "Call #username",
          "password": "Call #password",
          filtersettings: emptyFiltersettings
        }, {
          "instancelabel": "Instance 2",
          "timerPeriod": 5,
          "icingaversion": "cgi",
          "url": "",
          "username": "",
          "password": "",
          filtersettings: emptyFiltersettings
        }, {
          "instancelabel": "Instance 3",
          "timerPeriod": 5,
          "icingaversion": "cgi",
          "url": "",
          "username": "",
          "password": "",
          filtersettings: emptyFiltersettings
        }]));
  });

  describe('Sound selection', () => {
    beforeEach(() => {
      documentGetElementsByClassNameStub.reset();
    });

    it('should provide functions', () => {
      expect(window.SoundFileSelectors).toBeDefined();
      expect(typeof (window.SoundFileSelectors.setFiles)).toBe('function');
      expect(typeof (window.SoundFileSelectors.getFiles)).toBe('function');
      expect(typeof (window.SoundFileSelectors.init)).toBe('function');
    });

    /** When querying for dom elements, return something usable */
    function fakeSoundFileSelectors(arr) {
      documentGetElementsByClassNameStub
        .withArgs('soundfileselector')
        .returns({
          length: arr.length,
          item: (index) => {
            return {
              getAttribute: (attributeName) => {
                if (attributeName == 'data-soundevent') {
                  return arr[index];
                }
              },
              appendChild: () => { }
            }
          }
        });
      SoundFileSelectors.init();
    }

    it('should set and get files', () => {
      const filedata = {
        'a': {
          id: 'a',
          filename: 'FILE-A',
          data: '1234'
        },
        'x': {
          id: 'x',
          filename: 'FILE-X',
          data: '1a2b'
        }
      };

      fakeSoundFileSelectors(['a', 'x']);

      window.SoundFileSelectors.init();
      window.SoundFileSelectors.setFiles(filedata);
      const r = window.SoundFileSelectors.getFiles();
      expect(r).toEqual(filedata);
    });

    it('should update filenameTextNode', () => {
      const c = new SoundFileSelectorControl('a');
      const m = { textContent: '' };
      c.setUIFilename(m);

      c.setFilename('jewp');

      expect(m.textContent).toBe('jewp');
    });

    it('should update filenameTextNode on restore', () => {
      const c = new SoundFileSelectorControl('a');
      const m = { textContent: 'gfdg8' };
      c.setUIFilename(m);

      c.restore({ filename: '5g9d', data: 'l' })

      expect(m.textContent).toBe('5g9d');
    });

    it('should update filename on delete', () => {
      const c = new SoundFileSelectorControl('a');
      const m = { textContent: 'kdlsa' };
      c.setUIFilename(m);
      c.setFilename('jewp');

      c.deleteFile();

      expect(m.textContent).toBe(SoundFileSelectorControl.noFileSetText);
    });

    it('should update filedata', () => {
      const c = new SoundFileSelectorControl('a');

      c.filedata = 'jkluoi';

      const r = c.toObject();
      expect(r.data).toBe('jkluoi');
    });

    it('should update filedata on restore', () => {
      const c = new SoundFileSelectorControl('a');
      c.restore({ filename: '5g9d', data: 'djlsajdlsal' });

      const r = c.toObject();
      expect(r.data).toBe('djlsajdlsal');
    });

    it('should respond false to hasAudioData', () => {
      const c = new SoundFileSelectorControl('a');

      expect(c.hasAudioData).toBeFalsy();
    });

    it('should respond true to hasAudioData', () => {
      const c = new SoundFileSelectorControl('a');
      c.filedata = 'abbd';

      expect(c.hasAudioData).toBeTruthy();
    });


    it('should respond false to hasAudioData after delete', () => {
      const c = new SoundFileSelectorControl('a');
      c.filedata = 'abbd';
      c.deleteFile();

      expect(c.hasAudioData).toBeFalsy();
    });

    it('should restore settings from options', (done) => {
      loadOptions = sinon.stub().resolves({ sounds: '{"sGREEN":{"id":"sGREEN","filename":"","data":null},"xRED":{"id":"xRED","filename":"","data":null}}' });
      const stub = sinon.stub(SoundFileSelectors, 'setFiles');
      restoreOptions().then(() => {
        expect(stub.callCount).toBe(1);
        expect(stub.args[0][0]).toEqual({ sGREEN: Object({ id: 'sGREEN', filename: '', data: null }), xRED: Object({ id: 'xRED', filename: '', data: null }) });
        stub.restore();
        done();
      });
    });

    it('should update empty settings from options', () => {
      const setSpy = host.storage.local.set;
      addInstance();
      getFormTextValueStub.callsFake((selector, defaultValue) => {
        if ('#timerPeriod' === selector) {
          return '17'
        }
        return "Call " + selector;
      });

      fakeSoundFileSelectors(['sGREEN', 'xRED']);

      updateSettings();

      expect(setSpy.callCount).toBe(1);
      const arg = setSpy.args[0];
      expect(arg[0].sounds).toEqual(JSON.stringify({ sGREEN: Object({ id: 'sGREEN', filename: '', data: null }), xRED: Object({ id: 'xRED', filename: '', data: null }) }));
    });
  });
});
