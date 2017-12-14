import 'mocha';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { Monitor } from '../scripts/MonitorData';
import { AbstractEnvironment } from '../scripts/AbstractEnvironment';

describe('AbstractEnvironnment', () => {
  it('should register and handle one alarm', () => {
    const mae = new MockAbstractEnvironment();
    const alarmName1 = 'm1';
    const spy = sinon.spy();
    mae.registerAlarmCallbackPublic(alarmName1, spy);
    expect(spy.called).to.equal(false);
    mae.handleAlarmPublic({ name: alarmName1 });
    expect(spy.called).to.equal(true);
  });

  it('should register and handle two alarms', () => {
    const mae = new MockAbstractEnvironment();
    const alarmNames = ['m1', 'xy'];
    const spies = [sinon.spy(), sinon.spy()];
    mae.registerAlarmCallbackPublic(alarmNames[0], spies[0]);
    mae.registerAlarmCallbackPublic(alarmNames[1], spies[1]);

    // until here, no callback has been executed
    expect(spies[0].called).to.equal(false);
    expect(spies[1].called).to.equal(false);

    // trigger first alarm
    mae.handleAlarmPublic({ name: alarmNames[0] });

    // first callback has been executed
    expect(spies[0].called).to.equal(true);
    // second callback has not been executed
    expect(spies[1].called).to.equal(false);

    // reset spies
    spies.forEach((spy) => spy.reset());

    // callbacks have not been executed after reset
    expect(spies[0].called).to.equal(false);
    expect(spies[1].called).to.equal(false);

    // trigger second alarm
    mae.handleAlarmPublic({ name: alarmNames[1] });

    // first callback has not been executed
    expect(spies[0].called).to.equal(false);
    // second callback has been executed
    expect(spies[1].called).to.equal(true);
  });

  it('should merge error results to status', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    b[2] = Monitor.ErrorMonitorData('Fail 1');
    b[5] = Monitor.ErrorMonitorData('Fail 2');

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getState()).to.equal(Monitor.Status.RED);
  });

  it('should merge error results to message', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    b[2] = Monitor.ErrorMonitorData('Fail 1');
    b[2].instanceLabel = 'U1';
    b[5] = Monitor.ErrorMonitorData('Fail 2');
    b[5].instanceLabel = 'U2';

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getMessage()).to.equal('(U1) Fail 1\n(U2) Fail 2');
  });


  it('should merge error result and green result to message', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    b[2] = Monitor.ErrorMonitorData('Fail 1');
    b[2].instanceLabel = 'U1';
    b[2].updateCounters();
    b[5] = new Monitor.MonitorData();
    b[5].instanceLabel = 'U2';
    b[5].updateCounters();

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getMessage()).to.equal('(U1) Fail 1');
  });

  it('should merge empty buffer', () => {
    const r = AbstractEnvironment.mergeResultsFromAllInstances({});
    expect(r.getState()).to.equal(Monitor.Status.RED);
    expect(r.getMessage()).to.equal('Update pending');
  });

  it('should merge yellow and green results to yellow', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new Monitor.MonitorData();
      const h = new Monitor.Host('U1');
      const s = new Monitor.Service('S' + i);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      h.setState('UP');
      s.status = i % 2 === 1 ? 'WARNING' : 'OK';
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getState()).to.equal(Monitor.Status.YELLOW);
  });


  it('should merge green results to green', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new Monitor.MonitorData();
      m.setState(Monitor.Status.GREEN);
      b[i] = m;
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getState()).to.equal(Monitor.Status.GREEN);
  });

  it('should sum hosterrors', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new Monitor.MonitorData();
      const h = new Monitor.Host('U1');

      b[i] = m;
      m.addHost(h);

      h.setState('DOWN');
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.hosterrors).to.equal(4);
  });

  it('should sum hostup', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    for (let i = 0; i < 7; i++) {
      const m = new Monitor.MonitorData();
      const h = new Monitor.Host('U1');

      b[i] = m;
      m.addHost(h);

      h.setState('UP');
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.hostup).to.equal(7);
  });

  it('should sum serviceerrors', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    for (let i = 0; i < 6; i++) {
      const m = new Monitor.MonitorData();
      const h = new Monitor.Host('U1');
      const s = new Monitor.Service('S' + i);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      s.status = 'CRITICAL';
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.serviceerrors).to.equal(6);
  });

  it('should sum servicewarnings', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    for (let i = 0; i < 5; i++) {
      const m = new Monitor.MonitorData();
      const h = new Monitor.Host('U1');
      const s = new Monitor.Service('S' + i);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      s.status = 'WARNING';
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.servicewarnings).to.equal(5);
  });

  it('should sum serviceok', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new Monitor.MonitorData();
      const h = new Monitor.Host('U1');
      const s = new Monitor.Service('S' + i);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      s.status = 'OK';
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.serviceok).to.equal(4);
  });

  it('should sum error results to hosterrors', () => {
    const b: { [index: number]: Monitor.MonitorData } = {};
    b[2] = Monitor.ErrorMonitorData('Fail 1');
    b[5] = Monitor.ErrorMonitorData('Fail 2');
    b[2].updateCounters();
    b[5].updateCounters();

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.hosterrors).to.equal(2);
  });

  it('should update time when displayStatus() is called', () => {
    const index = 5;
    const mae = new MockAbstractEnvironment();
    mae.registerMonitorInstance(index, { instancelabel: 't1' });
    const monitorData = Monitor.ErrorMonitorData('');
    monitorData.updatetime = 'cat fish dog';

    mae.displayStatus(index, monitorData);

    const buf = mae.getDataBuffer();
    expect(buf.instances).to.be.an('object');
    expect(buf.instances[index]).to.be.an('object');
    expect(buf.instances[index].updatetime).to.equal('cat fish dog');
  })
});
