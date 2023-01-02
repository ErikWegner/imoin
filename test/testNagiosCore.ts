import { fail } from 'assert';
import { expect } from 'chai';
import 'mocha';

import { NagiosCore, Status } from '../scripts/monitors';
import { ImoinMonitorInstance } from '../scripts/Settings';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { LoadCallbackBuilder } from './abstractHelpers/LoadCallbackBuilder';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { SettingsBuilder } from './abstractHelpers/SettingsBuilder';
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
    const e = new MockAbstractEnvironment();
    const settings: ImoinMonitorInstance = {
      icingaversion: 'nagioshtml',
      instancelabel: 'unittest',
      url: '/unittest',
      timerPeriod: 5,
      username: 'user',
      password: 'pass',
    };
    const u = new NagiosCore(e, settings, 0);
    e.loadCallback = (url): Promise<string> => {
      if (url.indexOf('hostlist') > -1) {
        return Promise.resolve('defect{JSON}-"data');
      }
      if (url.indexOf('servicelist') > -1) {
        return Promise.resolve('{}');
      }
      fail('loadCallback not configured for ' + url);
      return Promise.reject('loadCallback not configured for ' + url);
    };
    return u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Status.RED);
      expect(r.getMessage()).to.equal('Could not parse host data.');
    });
  });

  it('should handle JSON.parse-exception for service data', () => {
    const e = new MockAbstractEnvironment();
    const settings: ImoinMonitorInstance = {
      icingaversion: 'nagioshtml',
      instancelabel: 'unittest',
      url: '/unittest',
      timerPeriod: 5,
      username: 'user',
      password: 'pass',
    };
    const u = new NagiosCore(e, settings, 0);
    e.loadCallback = (url): Promise<string> => {
      if (url.indexOf('hostlist') > -1) {
        return Promise.resolve('{}');
      }
      if (url.indexOf('servicelist') > -1) {
        return Promise.resolve('defect{JSON');
      }
      fail('loadCallback not configured for ' + url);
      return Promise.reject('No');
    };
    return u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Status.RED);
      expect(r.getMessage()).to.equal('Could not parse service data.');
    });
  });

  it('should set link to host page', () => {
    const baseurl = 'http://nagioscore.demos.nagios.com/nagios';
    const pathAndQuery = '/cgi-bin/extinfo.cgi?type=1&host=';
    const e = new MockAbstractEnvironment();
    const settings = SettingsBuilder.create('nagioscore').build();
    const u = new NagiosCore(e, settings, 0);
    settings.url = baseurl;

    const data = new LoadCallbackBuilder()
      .Host('H1')
      .Host('H2')
      .BuildCallbacks('nagioscore');

    e.loadCallback = loadCallback(data[0], data[1]);

    return u.fetchStatus().then((r) => {
      expect(r.hosts).to.have.lengthOf(2);
      expect(r.hosts[0].hostlink).to.equal(`${baseurl}${pathAndQuery}H1`);
      expect(r.hosts[1].hostlink).to.equal(`${baseurl}${pathAndQuery}H2`);
    });
  });

  it('should set link to service page', () => {
    const baseurl = 'http://nagioscore.demos.nagios.com/nagios';
    const pathAndQuery = '/cgi-bin/extinfo.cgi?type=2&';
    const e = new MockAbstractEnvironment();
    const settings = SettingsBuilder.create('nagioscore').build();
    const u = new NagiosCore(e, settings, 0);
    settings.url = baseurl;

    const data = new LoadCallbackBuilder()
      .Host('H1')
      .Service('/ Disk Usage', () => {
        /* no op */
      })
      .Service('SSH Server', () => {
        /* no op */
      })
      .Host('H2')
      .Service('S3', () => {
        /* no op */
      })
      .BuildCallbacks('nagioscore');

    e.loadCallback = loadCallback(data[0], data[1]);

    return u.fetchStatus().then((r) => {
      expect(r.hosts).to.have.lengthOf(2);
      const host1 = r.hosts[0];
      expect(host1.services).to.have.lengthOf(2);
      expect(host1.services[0].servicelink).to.equal(
        `${baseurl}${pathAndQuery}host=H1&service=%2F+Disk+Usage`
      );
      expect(host1.services[1].servicelink).to.equal(
        `${baseurl}${pathAndQuery}host=H1&service=SSH+Server`
      );
      const host2 = r.hosts[1];
      expect(host2.services).to.have.lengthOf(1);
      expect(host2.services[0].servicelink).to.equal(
        `${baseurl}${pathAndQuery}host=H2&service=S3`
      );
    });
  });

  Object.keys(filterSettingsTests).forEach((description) => {
    const options = filterSettingsTests[description];
    describe(description, () => {
      function buildSettings() {
        const settings = SettingsBuilder.create('nagioscore').build();
        FilterSettingsBuilder.with(settings).setup(
          options.setupFilterSettingsBuilder
        );
        return settings;
      }

      it(`should set ${options.hostProperty} on host`, () => {
        const e = new MockAbstractEnvironment();

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .setup(options.setupHost)
          .Host('H2')
          .BuildCallbacks('nagioscore');

        e.loadCallback = loadCallback(data[0], data[1]);

        const settings = buildSettings();

        const u = new NagiosCore(e, settings, 0);
        return u.fetchStatus().then((r) => {
          expect(r.hosts).to.have.lengthOf(2);
          expect(r.hosts[0][options.hostProperty]).to.equal(true);
          expect(r.hosts[1][options.hostProperty]).to.equal(false);
        });
      });

      it('should set ' + options.serviceProperty + ' on service', () => {
        const e = new MockAbstractEnvironment();
        const settings = buildSettings();
        const u = new NagiosCore(e, settings, 0);

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .Service('S1', options.setupService)
          .Service('S2', () => {
            /* no op */
          })
          .BuildCallbacks('nagioscore');

        e.loadCallback = loadCallback(data[0], data[1]);

        return u.fetchStatus().then((v) => {
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
