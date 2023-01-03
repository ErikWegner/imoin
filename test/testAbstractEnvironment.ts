import { fail } from 'assert';
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { AbstractEnvironment } from '../scripts/AbstractEnvironment';
import {
  ErrorMonitorData,
  Host,
  MonitorData,
  Service,
  Status,
} from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';

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
    spies.forEach((spy) => spy.resetHistory());

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
    const b: { [index: number]: MonitorData } = {};
    b[2] = ErrorMonitorData('Fail 1');
    b[5] = ErrorMonitorData('Fail 2');

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getState()).to.equal(Status.RED);
  });

  it('should merge error results to message', () => {
    const b: { [index: number]: MonitorData } = {};
    b[2] = ErrorMonitorData('Fail 1');
    b[2].instanceLabel = 'U1';
    b[5] = ErrorMonitorData('Fail 2');
    b[5].instanceLabel = 'U2';

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getMessage()).to.equal('(U1) Fail 1\n(U2) Fail 2');
  });

  it('should merge error result and green result to message', () => {
    const b: { [index: number]: MonitorData } = {};
    b[2] = ErrorMonitorData('Fail 1');
    b[2].instanceLabel = 'U1';
    b[2].updateCounters();
    b[5] = new MonitorData();
    b[5].instanceLabel = 'U2';
    b[5].updateCounters();

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getMessage()).to.equal('(U1) Fail 1');
  });

  it('should merge empty buffer', () => {
    const r = AbstractEnvironment.mergeResultsFromAllInstances({});
    expect(r.getState()).to.equal(Status.RED);
    expect(r.getMessage()).to.equal('Update pending');
  });

  it('should merge yellow and green results to yellow', () => {
    const b: { [index: number]: MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new MonitorData();
      const h = new Host('U1');
      const s = new Service(`S${i}`);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      h.setState('UP');
      s.setState(i % 2 === 1 ? 'WARNING' : 'OK');

      m.updateCounters();
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getState()).to.equal(Status.YELLOW);
  });

  it('should merge green results to green', () => {
    const b: { [index: number]: MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new MonitorData();
      m.setState(Status.GREEN);
      b[i] = m;
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.getState()).to.equal(Status.GREEN);
  });

  it('should sum hosterrors', () => {
    const b: { [index: number]: MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new MonitorData();
      const h = new Host('U1');

      b[i] = m;
      m.addHost(h);

      h.setState('DOWN');

      m.updateCounters();
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.hosterrors).to.equal(4);
  });

  it('should sum hostup', () => {
    const b: { [index: number]: MonitorData } = {};
    for (let i = 0; i < 7; i++) {
      const m = new MonitorData();
      const h = new Host('U1');

      b[i] = m;
      m.addHost(h);

      h.setState('UP');

      m.updateCounters();
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.hostup).to.equal(7);
  });

  it('should sum serviceerrors', () => {
    const b: { [index: number]: MonitorData } = {};
    for (let i = 0; i < 6; i++) {
      const m = new MonitorData();
      const h = new Host('U1');
      const s = new Service(`S${i}`);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      s.setState('CRITICAL');

      m.updateCounters();
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.serviceerrors).to.equal(6);
  });

  it('should sum servicewarnings', () => {
    const b: { [index: number]: MonitorData } = {};
    for (let i = 0; i < 5; i++) {
      const m = new MonitorData();
      const h = new Host('U1');
      const s = new Service(`S${i}`);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      s.setState('WARNING');

      m.updateCounters();
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.servicewarnings).to.equal(5);
  });

  it('should sum serviceok', () => {
    const b: { [index: number]: MonitorData } = {};
    for (let i = 0; i < 4; i++) {
      const m = new MonitorData();
      const h = new Host('U1');
      const s = new Service(`S${i}`);

      b[i] = m;
      m.addHost(h);
      h.addService(s);

      s.setState('OK');

      m.updateCounters();
    }

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.serviceok).to.equal(4);
  });

  it('should sum error results to hosterrors', () => {
    const b: { [index: number]: MonitorData } = {};
    b[2] = ErrorMonitorData('Fail 1');
    b[5] = ErrorMonitorData('Fail 2');
    b[2].updateCounters();
    b[5].updateCounters();

    const r = AbstractEnvironment.mergeResultsFromAllInstances(b);
    expect(r.hosterrors).to.equal(2);
  });

  it('should merge and update time stamp', () => {
    const m0 = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    m0.addHost(host);
    host.addService(service);
    host.setState('UP');
    service.setState('CRITICAL');
    m0.updateCounters([]);
    const b: { [index: number]: MonitorData } = {};
    b[0] = m0;

    const mmerge = AbstractEnvironment.mergeResultsFromAllInstances(b);

    expect(mmerge.updatetime).to.not.be.undefined;
  });

  it('should merge results and keep filtered values', () => {
    // Create two instance results and merge them
    const m0 = new MonitorData();
    const host = new Host('H1');
    const service = new Service('S1');
    m0.addHost(host);
    host.addService(service);
    host.setState('UP');
    service.setState('CRITICAL');

    const m1 = new MonitorData();
    const host2 = new Host('H2');
    const service2 = new Service('S2');
    m1.addHost(host2);
    host2.addService(service2);
    host2.setState('UP');
    service2.setState('CRITICAL');

    m0.updateCounters([]);
    const c00 = m0.filteredServiceerrors;
    const c01 = m0.serviceerrors;
    m1.updateCounters([]);
    const c10 = m1.filteredServiceerrors;
    const c11 = m1.serviceerrors;

    const b: { [index: number]: MonitorData } = {};
    b[0] = m0;
    b[1] = m1;
    const mmerge = AbstractEnvironment.mergeResultsFromAllInstances(b);
    const cm0 = mmerge.filteredServiceerrors;
    const cm1 = mmerge.serviceerrors;

    expect(m1.totalservices).to.equal(1);
    // no host after filtering means no service error
    expect(c00).to.equal(0);
    // service error exists in unfiltered value
    expect(c01).to.equal(1);
    // no host after filtering means no service error
    expect(c10).to.equal(0);
    // service error exists in unfiltered value
    expect(c11).to.equal(1);

    // after merge, still no service error
    expect(cm0).to.equal(0);
    // after merge, two service error exists in unfiltered value
    expect(cm1).to.equal(2);
  });

  it('should update time when displayStatus() is called', () => {
    const index = 5;
    const mae = new MockAbstractEnvironment();
    mae.registerMonitorInstance(index, { instancelabel: 't1' });
    const monitorData = ErrorMonitorData('');
    monitorData.updatetime = 'cat fish dog';

    mae.displayStatus(index, monitorData);

    const buf = mae.getDataBuffer();
    expect(buf.instances).to.be.an('object');
    expect(buf.instances[index]).to.be.an('object');
    expect(buf.instances[index].updatetime).to.equal('cat fish dog');
  });

  describe('on first refresh should call audioNotification with isNew == true', () => {
    function testPlaySoundOnFirstRefresh(testValue: Status) {
      const index = 5;
      const mae = new MockAbstractEnvironment();
      mae.registerMonitorInstance(index, { instancelabel: 't1' });
      const callCount1 = mae.audioNotificationSpy.callCount;
      const m = new MonitorData();
      m.instanceLabel = 'U2';
      const service = new Service('S');
      service.setState(
        testValue === Status.GREEN
          ? 'OK'
          : testValue === Status.YELLOW
          ? 'WARNING'
          : 'CRITICAL'
      );
      const host = new Host('H');
      host.setState('UP');
      host.services.push(service);
      m.hosts.push(host);
      m.updateCounters();

      mae.displayStatus(index, m);

      // The monitoring instance is GREEN
      expect(m.getState()).to.equal(testValue);
      // No audioNotification has been called at the beginng
      expect(callCount1).to.equal(0);
      // audioNotification has been called now (after displayStatus)
      if (mae.audioNotificationSpy.callCount !== 1) {
        fail(
          mae.audioNotificationSpy.callCount,
          1,
          'audioNotification call count'
        );
      } else {
        const spyCall = mae.audioNotificationSpy.getCall(0);
        expect(spyCall.args[0]).to.equal(testValue);
        expect(spyCall.args[1]).to.equal(true);
      }
    }

    it('should play sound on state GREEN', () => {
      testPlaySoundOnFirstRefresh(Status.GREEN);
    });
    it('should play sound on state YELLOW', () => {
      testPlaySoundOnFirstRefresh(Status.YELLOW);
    });
    it('should play sound on state RED', () => {
      testPlaySoundOnFirstRefresh(Status.RED);
    });
  });

  describe('on second refresh should call audioNotification with isNew == false', () => {
    function testPlaySoundOnSecondRefresh(testValue: Status) {
      const index = 5;
      const mae = new MockAbstractEnvironment();
      mae.registerMonitorInstance(index, { instancelabel: 't1' });
      const callCount1 = mae.audioNotificationSpy.callCount;
      const m = new MonitorData();
      m.instanceLabel = 'U2';
      const service = new Service('S');
      service.setState(
        testValue === Status.GREEN
          ? 'OK'
          : testValue === Status.YELLOW
          ? 'WARNING'
          : 'CRITICAL'
      );
      const host = new Host('H');
      host.setState('UP');
      host.services.push(service);
      m.hosts.push(host);
      m.updateCounters();

      // first update
      mae.displayStatus(index, m);
      // second update, no change
      mae.displayStatus(index, m);

      // The monitoring instance state is the expected testValue
      expect(m.getState()).to.equal(testValue);
      // No audioNotification has been called at the beginng
      expect(callCount1).to.equal(0);
      // audioNotification has been called now (after displayStatus)
      if (mae.audioNotificationSpy.callCount !== 2) {
        fail(
          mae.audioNotificationSpy.callCount,
          2,
          'audioNotification call count'
        );
      } else {
        const spyCall1 = mae.audioNotificationSpy.getCall(0);
        expect(spyCall1.args[0]).to.equal(testValue);
        expect(spyCall1.args[1]).to.equal(true);
        const spyCall2 = mae.audioNotificationSpy.getCall(1);
        expect(spyCall2.args[0]).to.equal(testValue);
        expect(spyCall2.args[1]).to.equal(false);
      }
    }

    it('should call audioNotification on state GREEN', () => {
      testPlaySoundOnSecondRefresh(Status.GREEN);
    });
    it('should call audioNotification on state YELLOW', () => {
      testPlaySoundOnSecondRefresh(Status.YELLOW);
    });
    it('should call audioNotification on state RED', () => {
      testPlaySoundOnSecondRefresh(Status.RED);
    });
  });

  describe('on third refresh should call audioNotification with isNew == false', () => {
    function testPlaySoundOnThirdRefresh(testValue: Status) {
      const index = 5;
      const mae = new MockAbstractEnvironment();
      mae.registerMonitorInstance(index, { instancelabel: 't1' });
      const callCount1 = mae.audioNotificationSpy.callCount;
      const m = new MonitorData();
      m.instanceLabel = 'U2';
      const service = new Service('S');
      service.setState(
        testValue === Status.GREEN
          ? 'OK'
          : testValue === Status.YELLOW
          ? 'WARNING'
          : 'CRITICAL'
      );
      const host = new Host('H');
      host.setState('UP');
      host.services.push(service);
      m.hosts.push(host);
      m.updateCounters();

      // first update
      mae.displayStatus(index, m);
      // second update, no change
      mae.displayStatus(index, m);
      // third update, no change
      mae.displayStatus(index, m);

      // The monitoring instance is GREEN
      expect(m.getState()).to.equal(testValue);
      // No audioNotification has been called at the beginng
      expect(callCount1).to.equal(0);
      // audioNotification has been called now (after displayStatus)
      if (mae.audioNotificationSpy.callCount !== 3) {
        fail(
          mae.audioNotificationSpy.callCount,
          3,
          'audioNotification call count'
        );
      } else {
        const spyCall1 = mae.audioNotificationSpy.getCall(0);
        expect(spyCall1.args[0]).to.equal(testValue);
        expect(spyCall1.args[1]).to.equal(true);
        const spyCall2 = mae.audioNotificationSpy.getCall(1);
        expect(spyCall2.args[0]).to.equal(testValue);
        expect(spyCall2.args[1]).to.equal(false);
        const spyCall3 = mae.audioNotificationSpy.getCall(2);
        expect(spyCall3.args[0]).to.equal(testValue);
        expect(spyCall3.args[1]).to.equal(false);
      }
    }

    it('should call audioNotification on state GREEN', () => {
      testPlaySoundOnThirdRefresh(Status.GREEN);
    });
    it('should call audioNotification on state YELLOW', () => {
      testPlaySoundOnThirdRefresh(Status.YELLOW);
    });
    it('should call audioNotification on state RED', () => {
      testPlaySoundOnThirdRefresh(Status.RED);
    });
  });
});
