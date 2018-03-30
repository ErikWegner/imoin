import 'mocha';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { MockAbstractMonitor } from './abstractHelpers/MockAbstractMonitor';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { Monitor, AbstractMonitor } from '../scripts/monitors';
import { AbstractEnvironment } from '../scripts/AbstractEnvironment';
import { fail } from 'assert';
import { ImoinMonitorInstance, IcingaOptionsVersion } from '../scripts/Settings';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { ServiceBuilder } from './abstractHelpers/ServiceBuilder';

describe('AbstractMonitor', () => {
  function buildInstance(v: IcingaOptionsVersion): ImoinMonitorInstance {
    return {
      instancelabel: '',
      timerPeriod: 1,
      icingaversion: v,
      url: '',
      username: '',
      password: '',
    };
  }

  it('should call initTimer on environment', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    mam.init(mae, buildInstance('api1'), 0);

    mam.startTimer();

    expect(mae.initTimerSpy.calledOnce).to.equal(true);
  });

  it('should provide valid callback function as argument to initTimer', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    mam.init(mae, buildInstance('api1'), 0);

    mam.startTimer();

    const callback = mae.initTimerSpy.getCall(0).args[2];
    expect(typeof (callback)).to.equal('function');
  });

  it('should call abstract fetchStatus function on timer callback', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    mam.init(mae, buildInstance('api1'), 0);
    mam.startTimer();
    const timerCallback = mae.initTimerSpy.getCall(0).args[2];

    timerCallback();

    expect(mam.fetchStatusSpy.calledOnce).to.equal(true);
  });

  it('should call display status function on timer callback', (done) => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    const instance = buildInstance('api1');
    mam.init(mae, instance, 0);
    mam.startTimer();
    const timerCallback = mae.initTimerSpy.getCall(0).args[2];
    mae.displayStatusNotify = () => {
      expect(mae.displayStatusSpy.callCount).to.equal(1);
      done();
    };

    timerCallback();
  });

  it('should apply filter settings on timer callback', (done) => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor();
    const instance = buildInstance('api1');
    mam.init(mae, instance, 0);
    mam.startTimer();
    const timerCallback = mae.initTimerSpy.getCall(0).args[2];

    const setPanelVisibilitiesSpy = sinon.spy(AbstractMonitor, 'applyFilters');

    mae.displayStatusNotify = () => {
      expect(setPanelVisibilitiesSpy.callCount).to.equal(1);
      setPanelVisibilitiesSpy.restore();
      done();
    };

    timerCallback();
  });

  describe('filterStatus', () => {
    describe('filterOutAcknowledged', () => {
      function buildHostAck(title: string) {
        const host = new Monitor.Host(title);
        host.hasBeenAcknowledged = true;
        return host;
      }

      it('should filter acknowledged hosts (appearsInShortlist)', () => {
        // Arrange
        const status = new Monitor.MonitorData();
        status.addHost(new Monitor.Host('Not ack 1'));
        status.addHost(new Monitor.Host('Not ack 2'));
        status.addHost(buildHostAck('ack=true 1'));
        status.addHost(new Monitor.Host('Not ack 3'));
        status.addHost(buildHostAck('ack=true 2'));
        status.addHost(new Monitor.Host('Not ack 4'));
        status.hosts.forEach((h) => h.setState('DOWN'));

        const filtersettings = FilterSettingsBuilder.plain().filterOutAcknowledged().build();

        // Act
        const result = AbstractMonitor.applyFilters(status, filtersettings);

        // Assert
        expect(result.map((h) => h.getHost().appearsInShortlist)).to.deep.equal([
          true, true, true, true
        ]);
        expect(status.hosts.map((h) => h.appearsInShortlist)).to.deep.equal([
          true, true, false, true, false, true
        ]);
      });

      it('should filter acknowledged hosts (filteredState is UP)', () => {
        const status = new Monitor.MonitorData();
        status.addHost(new Monitor.Host('Not ack 1'));
        status.addHost(new Monitor.Host('Not ack 2'));
        status.addHost(buildHostAck('ack=true 1'));
        status.addHost(new Monitor.Host('Not ack 3'));
        status.addHost(buildHostAck('ack=true 2'));
        status.addHost(new Monitor.Host('Not ack 4'));
        status.hosts.forEach((h) => h.setState('DOWN'));

        const filtersettings = FilterSettingsBuilder.plain().filterOutAcknowledged().build();
        const result = AbstractMonitor.applyFilters(status, filtersettings);

        expect(result.map((h) => h.getHost().getFilteredState())).to.deep.equal([
          'DOWN', 'DOWN', 'DOWN', 'DOWN'
        ]);
      });

      it('should filter acknowledged services (appearsInShortlist)', () => {
        const status = new Monitor.MonitorData();
        status.addHost(new Monitor.Host('Not ack 1'));
        status.addHost(new Monitor.Host('Not ack 2'));
        status.addHost(new Monitor.Host('Not ack 3'));
        status.addHost(new Monitor.Host('Not ack 4'));
        status.addHost(new Monitor.Host('Not ack 5'));
        status.addHost(new Monitor.Host('Not ack 6'));
        /* All hosts are up */
        status.hosts.forEach((h) => h.setState('UP'));

        ServiceBuilder
          .create('S1').withStatus('OK')
          .addToHost(status.hosts[0]);
        ServiceBuilder
          .create('S2').withStatus('WARNING')
          .addToHost(status.hosts[1]);
        ServiceBuilder
          .create('S3').withStatus('CRITICAL')
          .hasBeenAcknowledged()
          .addToHost(status.hosts[2]);
        ServiceBuilder
          .create('S4').withStatus('OK')
          .addToHost(status.hosts[3]);
        ServiceBuilder
          .create('S5').withStatus('WARNING')
          .hasBeenAcknowledged()
          .addToHost(status.hosts[4]);
        ServiceBuilder
          .create('S6').withStatus('CRITICAL')
          .addToHost(status.hosts[5]);

        const filtersettings = FilterSettingsBuilder.plain().filterOutAcknowledged().build();
        const result = AbstractMonitor.applyFilters(status, filtersettings);

        // 2 hosts with errors remain after filtering (other failures are acknowledged)
        expect(result).to.have.lengthOf(2);

        // Host has no problems
        expect(status.hosts[0].appearsInShortlist).to.eq(false);
        // Host has a service problem and problem is not acknowledged
        expect(status.hosts[1].appearsInShortlist).to.eq(true);
        // Host has a service problem but problem is acknowledged
        expect(status.hosts[2].appearsInShortlist).to.eq(false);
        // Host has no problems
        expect(status.hosts[3].appearsInShortlist).to.eq(false);
        // Host has a service problem but problem is acknowledged
        expect(status.hosts[4].appearsInShortlist).to.eq(false);
        // Host has a service problem and problem is not acknowledged
        expect(status.hosts[5].appearsInShortlist).to.eq(true);
      });

      it('should filter acknowledged services (filteredState)', () => {
        const status = new Monitor.MonitorData();
        status.addHost(new Monitor.Host('Not ack 1'));
        status.addHost(new Monitor.Host('Not ack 2'));
        status.addHost(new Monitor.Host('Not ack 3'));
        status.addHost(new Monitor.Host('Not ack 4'));
        status.addHost(new Monitor.Host('Not ack 5'));
        status.addHost(new Monitor.Host('Not ack 6'));
        /* All hosts are up */
        status.hosts.forEach((h) => h.setState('UP'));

        ServiceBuilder
          .create('S1').withStatus('OK')
          .addToHost(status.hosts[0]);
        ServiceBuilder
          .create('S2').withStatus('WARNING')
          .addToHost(status.hosts[1]);
        ServiceBuilder
          .create('S3').withStatus('CRITICAL')
          .hasBeenAcknowledged()
          .addToHost(status.hosts[2]);
        ServiceBuilder
          .create('S4').withStatus('OK')
          .addToHost(status.hosts[3]);
        ServiceBuilder
          .create('S5').withStatus('WARNING')
          .hasBeenAcknowledged()
          .addToHost(status.hosts[4]);
        ServiceBuilder
          .create('S6').withStatus('CRITICAL')
          .addToHost(status.hosts[5]);

        const filtersettings = FilterSettingsBuilder.plain().filterOutAcknowledged().build();
        const result = AbstractMonitor.applyFilters(status, filtersettings);

        // Host has a service problem and problem is not acknowledged
        expect(result[0].getHost().services[0].getFilteredState()).to.eq('WARNING');
        // Host has a service problem and problem is not acknowledged
        expect(result[1].getHost().services[0].getFilteredState()).to.eq('CRITICAL');
      });
    });
  });
});
