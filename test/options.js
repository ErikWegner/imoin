describe('options html', () => {
  beforeEach(() => {
    // Re-Init global variables
    instances = [];
    selectedInstance = -1;
    // Stub browser interactions
    updateDOM = sinon.spy();
    saveOptions = sinon.spy();
    getFormTextValue = sinon.stub();
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
    getFormTextValue.callsFake((selector, defaultValue) => {
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
    expect(saveOptions.calledOnce).toBe(true);
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
});
