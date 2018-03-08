import 'mocha';
import { fail } from 'assert';
import { assert, expect } from 'chai';

import { Monitor, NagiosCore } from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { ImoinMonitorInstance } from '../scripts/Settings';

describe('NagiosCore', () => {
  it('should handle JSON.parse-excetion for host data', (done) => {
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
    }
    u.init(e, settings, 0);
    u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Monitor.Status.RED);
      expect(r.getMessage()).to.equal('Could not parse host data.');
      done();
    }).catch((e) => {
      fail(e);
      done();
    });
  });

  it('should handle JSON.parse-excetion for service data', (done) => {
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
    }
    u.init(e, settings, 0);
    u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Monitor.Status.RED);
      expect(r.getMessage()).to.equal('Could not parse service data.');
      done();
    }).catch((e) => {
      fail(e);
      done();
    });
  });
});
