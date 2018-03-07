import 'mocha';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { MockAbstractMonitor } from './abstractHelpers/MockAbstractMonitor';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { Monitor } from '../scripts/MonitorData';
import { AbstractEnvironment } from '../scripts/AbstractEnvironment';
import { fail } from 'assert';
import { ImoinMonitorInstance, IcingaOptionsVersion } from '../scripts/Settings';
import { AbstractMonitor } from '../scripts/AbstractMonitor';

describe('AbstractMonitor', () => {
  function buildInstance(v: IcingaOptionsVersion): ImoinMonitorInstance {
    return {
      instancelabel: '',
      timerPeriod: 1,
      icingaversion: v,
      url: '',
      username: '',
      password: '',
    }
  }

  it('should call initTimer on environment', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    mam.init(mae, buildInstance("api1"), 0);

    mam.startTimer();

    expect(mae.initTimerSpy.calledOnce).to.equal(true);
  });

  it('should provide valid callback function as argument to initTimer', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    mam.init(mae, buildInstance("api1"), 0);

    mam.startTimer();

    const callback = mae.initTimerSpy.getCall(0).args[2];
    expect(typeof (callback)).to.equal('function');
  });

  it('should call abstract fetchStatus function on timer callback', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    mam.init(mae, buildInstance("api1"), 0);
    mam.startTimer();
    const timerCallback = mae.initTimerSpy.getCall(0).args[2];

    timerCallback();

    expect(mam.fetchStatusSpy.calledOnce).to.equal(true);
  });


  it('should call display status function on timer callback', (done) => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    const instance = buildInstance("api1");
    mam.init(mae, instance, 0);
    mam.startTimer();
    const timerCallback = mae.initTimerSpy.getCall(0).args[2];
    mae.displayStatusNotify = () => {
      expect(mae.displayStatusSpy.callCount).to.equal(1);
      done();
    }

    timerCallback();
  });

  it('should apply filter settings on timer callback', (done) => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    const instance = buildInstance("api1");
    mam.init(mae, instance, 0);
    mam.startTimer();
    const timerCallback = mae.initTimerSpy.getCall(0).args[2];

    const filterStatusSpy = sinon.spy(AbstractMonitor, 'filterStatus');

    mae.displayStatusNotify = () => {
      expect(filterStatusSpy.callCount).to.equal(1);
      filterStatusSpy.restore();
      done();
    }

    timerCallback();
  });

  describe('filterStatus', () => {
    function buildHostAck(title: string) {
      const host = new Monitor.Host(title);
      host.has_been_acknowledged = true;
      return host;
    }
    it('should filter acknowledged hosts', () => {
      const status = new Monitor.MonitorData();
      status.addHost(new Monitor.Host("Not ack 1"));
      status.addHost(new Monitor.Host("Not ack 2"));
      status.addHost(buildHostAck("ack=true 1"));
      status.addHost(new Monitor.Host("Not ack 3"));
      status.addHost(buildHostAck("ack=true 2"));
      status.addHost(new Monitor.Host("Not ack 4"));

      const filtered = AbstractMonitor.filterStatus(status);

      expect(filtered.hosts.length).to.equal(4);
    });
  });
});
