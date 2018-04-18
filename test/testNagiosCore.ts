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
    };
    u.init(e, settings, 0);
    u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Monitor.Status.RED);
      expect(r.getMessage()).to.equal('Could not parse host data.');
      done();
    }).catch((err) => {
      fail(err);
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
    };
    u.init(e, settings, 0);
    u.fetchStatus().then((r) => {
      expect(r.getState()).to.equal(Monitor.Status.RED);
      expect(r.getMessage()).to.equal('Could not parse service data.');
      done();
    }).catch((err) => {
      fail(err);
      done();
    });
  });

  it('should set hasBeenAcknowledged on host', (done) => {
    const u = new NagiosCore();
    const e = new MockAbstractEnvironment();
    e.loadCallback = (url, user, passwd): Promise<string> => {
      if (url.indexOf('hostlist') > -1) {
        const hostdata = {
          data: {
            hostlist: {
              host1 : {
                name: 'host1',
                status: 4,
                plugin_output: '',
                problem_has_been_acknowledged: false
              },
              host2 : {
                name: 'host2',
                status: 4,
                plugin_output: '',
                problem_has_been_acknowledged: true
              },
            }
          }
        };
        return Promise.resolve(JSON.stringify(hostdata));
      }
      if (url.indexOf('servicelist') > -1) {
        const servicedata = {
          data: {
            servicelist: {
              host1: {
                service1: {
                  host_name: 'host1',
                  description: '',
                  status: 16,
                  last_check: 1521236816000,
                  plugin_output: '',
                  problem_has_been_acknowledged: false
                }
              },
              host2: {
                service2: {
                  host_name: 'host2',
                  description: '',
                  status: 16,
                  last_check: 1521236816000,
                  plugin_output: '',
                  problem_has_been_acknowledged: true
                }
              },
            }
          }
        };
        return Promise.resolve(JSON.stringify(servicedata));
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
    u.fetchStatus().then((r) => {
      expect(r.hosts).to.have.lengthOf(2);
      expect(r.hosts[0].hasBeenAcknowledged).to.eq(false);
      expect(r.hosts[1].hasBeenAcknowledged).to.eq(true);
      expect(r.hosts[0].services[0].hasBeenAcknowledged).to.eq(false);
      expect(r.hosts[1].services[0].hasBeenAcknowledged).to.eq(true);
      done();
    }).catch((err) => {
      fail(err);
      done();
    });
  });
});
