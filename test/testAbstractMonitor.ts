import { fail } from 'assert';
import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { AbstractMonitor, Host, MonitorData } from '../scripts/monitors/index.js';
import {
  IcingaOptionsVersion,
  ImoinMonitorInstance,
} from '../scripts/Settings.js';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder.js';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment.js';
import { MockAbstractMonitor } from './abstractHelpers/MockAbstractMonitor.js';
import { MonitorStatusBuilder } from './abstractHelpers/MonitorStatusBuilder.js';
import { ServiceBuilder } from './abstractHelpers/ServiceBuilder.js';
import { filterSettingsTests } from './filterSettingsTestsCommons.js';

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
    const mam = new MockAbstractMonitor(mae, buildInstance('api1'), 0);

    mam.startTimer();

    expect(mae.initTimerSpy.calledOnce).to.equal(true);
  });

  it('should provide valid callback function as argument to initTimer', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor(mae, buildInstance('api1'), 0);

    mam.startTimer();

    const callback: unknown = mae.initTimerSpy.getCall(0).args[2];
    expect(typeof callback).to.equal('function');
  });

  it('should call abstract fetchStatus function on timer callback', () => {
    const mae = new MockAbstractEnvironment();
    const mam = new MockAbstractMonitor(mae, buildInstance('api1'), 0);
    mam.startTimer();
    const timerCallback = mae.initTimerSpy.getCall(0).args[2];

    timerCallback();

    expect(mam.fetchStatusSpy.calledOnce).to.equal(true);
  });

  it('should call display status function on timer callback', (done) => {
    const mae = new MockAbstractEnvironment();
    const instance = buildInstance('api1');
    const mam = new MockAbstractMonitor(mae, instance, 0);
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
    const instance = buildInstance('api1');
    const mam = new MockAbstractMonitor(mae, instance, 0);
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
    Object.keys(filterSettingsTests).forEach((description) => {
      const options = filterSettingsTests[description];

      describe(description, () => {
        function buildSettings() {
          return FilterSettingsBuilder.plain()
            .setup(options.setupFilterSettingsBuilder)
            .build();
        }

        it(
          'should filter ' + description + ' hosts (appearsInShortlist)',
          () => {
            // Arrange
            const status = new MonitorStatusBuilder()
              .Host('H1')
              .Down()
              .Host('H2')
              .Down()
              .Host('H3')
              .Down()
              .setup(options.setupHost)
              .Host('H4')
              .Down()
              .Host('H5')
              .Down()
              .setup(options.setupHost)
              .Host('H6')
              .Down()
              .BuildStatus();

            const filtersettings = buildSettings();

            // Act
            const result = AbstractMonitor.applyFilters(status, filtersettings);

            // Assert
            expect(
              result?.map((h) => h.getHost().appearsInShortlist)
            ).to.deep.equal([true, true, true, true]);
            expect(status.hosts.map((h) => h.appearsInShortlist)).to.deep.equal(
              [true, true, false, true, false, true]
            );
          }
        );

        it(
          'should apply filter ' +
            description +
            ' to hosts (filteredState is UP)',
          () => {
            const status = new MonitorStatusBuilder()
              .Host('H1')
              .Down()
              .Host('H2')
              .Down()
              .Host('H3')
              .Down()
              .setup(options.setupHost)
              .Host('H4')
              .Down()
              .Host('H5')
              .Down()
              .setup(options.setupHost)
              .Host('H6')
              .Down()
              .BuildStatus();

            const filtersettings = buildSettings();
            const result = AbstractMonitor.applyFilters(status, filtersettings);

            expect(result).to.have.lengthOf(4);
          }
        );

        it(
          'should filter ' +
            description +
            ' services (host.appearsInShortlist)',
          () => {
            const status = new MonitorData();
            status.addHost(new Host('Not ack 1'));
            status.addHost(new Host('Not ack 2'));
            status.addHost(new Host('Not ack 3'));
            status.addHost(new Host('Not ack 4'));
            status.addHost(new Host('Not ack 5'));
            status.addHost(new Host('Not ack 6'));
            /* All hosts are up */
            status.hosts.forEach((h) => h.setState('UP'));

            ServiceBuilder.create('S1')
              .withStatus('OK')
              .addToHost(status.hosts[0]);
            ServiceBuilder.create('S2')
              .withStatus('WARNING')
              .addToHost(status.hosts[1]);
            ServiceBuilder.create('S3')
              .withStatus('CRITICAL')
              .setup(options.setupService)
              .addToHost(status.hosts[2]);
            ServiceBuilder.create('S4')
              .withStatus('OK')
              .addToHost(status.hosts[3]);
            ServiceBuilder.create('S5')
              .withStatus('WARNING')
              .setup(options.setupService)
              .addToHost(status.hosts[4]);
            ServiceBuilder.create('S6')
              .withStatus('CRITICAL')
              .addToHost(status.hosts[5]);

            const filtersettings = buildSettings();
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
          }
        );

        it(
          'should filter ' +
            description +
            ' services (service.appearsInShortlist)',
          () => {
            const status = new MonitorData();
            status.addHost(new Host('Not ack 1'));
            status.addHost(new Host('Not ack 2'));
            status.addHost(new Host('Not ack 3'));
            status.addHost(new Host('Not ack 4'));
            status.addHost(new Host('Not ack 5'));
            status.addHost(new Host('Not ack 6'));
            /* All hosts are up */
            status.hosts.forEach((h) => h.setState('UP'));

            ServiceBuilder.create('S1')
              .withStatus('OK')
              .addToHost(status.hosts[0]);
            ServiceBuilder.create('S2')
              .withStatus('WARNING')
              .addToHost(status.hosts[0]);
            ServiceBuilder.create('S3')
              .withStatus('CRITICAL')
              .setup(options.setupService)
              .addToHost(status.hosts[0]);
            ServiceBuilder.create('S4')
              .withStatus('OK')
              .addToHost(status.hosts[1]);
            ServiceBuilder.create('S5')
              .withStatus('WARNING')
              .setup(options.setupService)
              .addToHost(status.hosts[1]);
            ServiceBuilder.create('S6')
              .withStatus('CRITICAL')
              .addToHost(status.hosts[1]);

            const filtersettings = buildSettings();
            const result = AbstractMonitor.applyFilters(status, filtersettings);

            if (result) {
              // S1 service has no problem
              expect(result[0].getHost().services[0].appearsInShortlist).to.eq(
                false
              );
              // S2 has a problem and problem is not acknowledged
              expect(result[0].getHost().services[1].appearsInShortlist).to.eq(
                true
              );
              // S3 has a problem and problem is acknowledged
              expect(result[0].getHost().services[2].appearsInShortlist).to.eq(
                false
              );
              // S4 service has no problem
              expect(result[1].getHost().services[0].appearsInShortlist).to.eq(
                false
              );
              // S5 has a problem and problem is acknowledged
              expect(result[1].getHost().services[1].appearsInShortlist).to.eq(
                false
              );
              // S6 has a problem and problem is not acknowledged
              expect(result[1].getHost().services[2].appearsInShortlist).to.eq(
                true
              );
            } else {
              fail('result is null');
            }
          }
        );
      });
    });
  });

  describe('filterOutServicesOnDownHosts', () => {
    it('should apply filter', () => {
      const status = new MonitorStatusBuilder()
        .Host('H1')
        .Down()
        .Host('H2')
        .Down()
        .Service('S1', (b) => b.withStatus('WARNING'))
        .Host('H3')
        .Down()
        .Service('S2', (b) => b.withStatus('CRITICAL'))
        .Host('H4')
        .BuildStatus();

      const filtersettings = FilterSettingsBuilder.plain()
        .filterOutServicesOnDownHosts() // only DOWN hosts
        .build();

      const result = AbstractMonitor.applyFilters(status, filtersettings);

      expect(result).to.have.lengthOf(4);
      result?.forEach((fhost) => {
        expect(fhost.getFServices()).to.have.lengthOf(0);
      });
    });
  });

  describe('filterOutServicesOnAcknowledgedHosts', () => {
    it('should apply filter', () => {
      const status = new MonitorStatusBuilder()
        .Host('H1')
        .Down()
        .Host('H2')
        .HasBeenAcknowledged()
        .Service('S1', (b) => b.withStatus('WARNING'))
        .Host('H3')
        .Service('S2', (b) => b.withStatus('CRITICAL'))
        .Host('H4')
        .Host('H5')
        .Service('S1', (b) => b.withStatus('WARNING'))
        .Host('H6')
        .HasBeenAcknowledged()
        .Service('S2', (b) => b.withStatus('CRITICAL'))
        .Host('H7')
        .HasBeenAcknowledged()
        .BuildStatus();

      const filtersettings = FilterSettingsBuilder.plain()
        .filterOutServicesOnAcknowledgedHosts()
        .build();

      const result = AbstractMonitor.applyFilters(status, filtersettings);

      const resultHostsAndServices: { [hostname: string]: number } = {};
      result?.forEach(
        (host) =>
          (resultHostsAndServices[host.getHost().name] =
            host.getFServices().length)
      );
      expect(resultHostsAndServices).to.deep.equal({
        H1: 0,
        H2: 0,
        H3: 1,
        H4: 0,
        H5: 1,
        H6: 0,
        H7: 0,
      });
    });
  });
});
