import 'mocha';
import { fail } from 'assert';
import { expect } from 'chai';
import { Monitor, NagiosCore } from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { ImoinMonitorInstance } from '../scripts/Settings';
import { SettingsBuilder } from './abstractHelpers/SettingsBuilder';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { LoadCallbackBuilder } from './abstractHelpers/LoadCallbackBuilder';
import { filterSettingsTests } from './filterSettingsTestsCommons';

describe('NagiosCore', () => {
  function loadCallback(hostsdata: string, servicesdata: string) {
    return (url: string): Promise<string> => {
      if (url.indexOf('hostlist') > -1) {
        return Promise.resolve(hostsdata);
      }
      if (url.indexOf('servicelist') > -1) {
        return Promise.resolve(servicesdata);
      }
      fail('loadCallback not configured for ', url);
    };
  }

  it('should handle JSON.parse-exception for host data', () => {
    const u = new NagiosCore();
    const e = new MockAbstractEnvironment();
    e.loadCallback = (url, user, passwd): Promise<string> => {
      if (url.indexOf('hostlist') > -1) {
        return Promise.resolve('defect{JSON}-"data');
      }
      if (url.indexOf('servicelist') > -1) {
        return Promise.resolve('{}');
      }
      fail('loadCallback not configured for ' + url);
      return Promise.reject('loadCallback not configured for ' + url);
    };
    const settings: ImoinMonitorInstance = {
      icingaversion: 'nagioshtml',
      instancelabel: 'unittest',
      url: '/unittest',
      timerPeriod: 5,
      username: 'user',
      password: 'pass',
    };
    u.init(e, settings, 0);
    return u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Monitor.Status.RED);
      expect(r.getMessage()).to.equal('Could not parse host data.');
    });
  });

  it('should handle JSON.parse-exception for service data', () => {
    const u = new NagiosCore();
    const e = new MockAbstractEnvironment();
    e.loadCallback = (url, user, passwd): Promise<string> => {
      if (url.indexOf('hostlist') > -1) {
        return Promise.resolve('{}');
      }
      if (url.indexOf('servicelist') > -1) {
        return Promise.resolve('defect{JSON');
      }
      fail('loadCallback not configured for ', url);
      return Promise.reject('No');
    };
    const settings: ImoinMonitorInstance = {
      icingaversion: 'nagioshtml',
      instancelabel: 'unittest',
      url: '/unittest',
      timerPeriod: 5,
      username: 'user',
      password: 'pass',
    };
    u.init(e, settings, 0);
    return u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Monitor.Status.RED);
      expect(r.getMessage()).to.equal('Could not parse service data.');
    });
  });

  Object.keys(filterSettingsTests).forEach((description) => {
    const options = filterSettingsTests[description];
    describe(description, () => {

      function buildSettings() {
        const settings = SettingsBuilder.create('nagioscore').build();
        FilterSettingsBuilder.with(settings)
          .setup(options.setupFilterSettingsBuilder);
        return settings;
      }

      it('should set ' + options.hostProperty + ' on host', () => {
        const u = new NagiosCore();
        const e = new MockAbstractEnvironment();

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .setup(options.setupHost)
          .Host('H2')
          .BuildCallbacks('nagioscore');

        e.loadCallback = loadCallback(data[0], data[1]);

        const settings = buildSettings();

        u.init(e, settings, 0);
        return u.fetchStatus().then((r) => {
          expect(r.hosts).to.have.lengthOf(2);
          expect(r.hosts[0][options.hostProperty]).to.equal(true);
          expect(r.hosts[1][options.hostProperty]).to.equal(false);
        });
      });

      it('should set ' + options.serviceProperty + ' on service', () => {
        const u = new NagiosCore();
        const e = new MockAbstractEnvironment();
        const settings = buildSettings();

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .Service('S1', options.setupService)
          .Service('S2', () => { /* no op */ })
          .BuildCallbacks('nagioscore');

        e.loadCallback = loadCallback(data[0], data[1]);

        u.init(e, settings, 0);
        return u
          .fetchStatus()
          .then((v) => {
            expect(v.hosts).to.have.lengthOf(1);
            if (v.hosts.length > 0) {
              expect(v.hosts[0].name).to.equal('H1');
              const services = v.hosts[0].services;
              expect(services).to.have.lengthOf(2);
              if (services.length > 1) {
                expect(services[0][options.serviceProperty]).to.equal(true);
                expect(services[1][options.serviceProperty]).to.equal(false);
              } else {
                fail('Services missing');
              }
            } else {
              fail('No host');
            }
          });
      });
    });
  });
});
