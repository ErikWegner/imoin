describe('options html', () => {
  const getFormTextValueStub = sinon.stub(window, 'getFormTextValue');
  const documentQuerySelectorStub = sinon.stub(document, 'querySelector');
  const saveOptionsSpy = sinon.spy(window, 'saveOptions');

  beforeEach(() => {
    // Re-Init global variables
    instances = [];
    selectedInstance = -1;
    // Stub browser interactions
    updateDOM = sinon.spy();
    // Reset all stubs
    getFormTextValueStub.reset();
    documentQuerySelectorStub.reset();
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
    expect(updateDOM.calledOnce).toBe(true);
  });

  it('should add three instances', () => {
    const l = instances.length;
    addInstance();
    addInstance();
    addInstance();
    expect(instances.length).toBe(l + 3);
    expect(selectedInstance).toBe(2);
    expect(updateDOM.calledThrice).toBe(true);
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
    expect(saveOptionsSpy.callCount).toBe(1);
  });

  it('should call updateDOM after updating instance', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    updateDOM.reset(); // addInstance will call updateDOM

    updateInstance();
    expect(updateDOM.callCount).toBe(1);
  });

  it('should not remove last instance', () => {
    const l1 = instances.length;
    addInstance();
    const l2 = instances.length;
    updateDOM.reset(); // addInstance will call updateDOM
    removeInstance();
    const l3 = instances.length;

    expect(l1).toBe(0); // no instance when the test starts
    expect(l2).toBe(1); // one instance added
    expect(l3).toBe(1); // still one instance available

    expect(updateDOM.notCalled).toBe(true);
  });

  it('should remove selected instance', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    // select instance 2
    selectedInstance = 1;
    const removedInstance = instances[selectedInstance];

    updateDOM.reset(); // addInstance will call updateDOM
    removeInstance();
    expect(instances.indexOf(removedInstance)).toBe(-1);
    expect(updateDOM.calledOnce).toBe(true);
  });

  it('should remove last instance and update selectedInstance', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    // select instance 2
    const l1 = selectedInstance;
    const removedInstance = instances[selectedInstance];

    updateDOM.reset(); // addInstance will call updateDOM
    removeInstance();
    expect(instances.indexOf(removedInstance)).toBe(-1);
    expect(l1).toBe(3);
    expect(selectedInstance).toBe(2);
  });

  it('should restore options and update DOM', (done) => {
    restoreOptions().then(() => {
      expect(updateDOM.calledOnce).toBe(true);
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
  })

  it('should update dom after selected instance changes', () => {
    // create 4 instances
    for (let i = 0; i < 4; i++) { addInstance(); }
    const dc1 = updateDOM.callCount;
    selectionChanged({ target: { value: '2' } });
    const dc2 = updateDOM.callCount;

    // adding an instance calls updateDOM
    expect(dc1).toBe(4);
    // changing selected instance triggers updateDOM
    expect(dc2).toBe(5);
  })
});
