describe('options html', () => {
  beforeEach(() => {
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
});
