describe('options html', () => {
  beforeEach(() => {
    updateDOM = sinon.spy();
  });

  it('should add instance', () => {
    const l = instances.length;
    addInstance();
    expect(instances.length).toBe(l + 1);
    expect(updateDOM.calledOnce);
  });
});
