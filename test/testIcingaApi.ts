import 'mocha';
import { assert, expect } from 'chai';
import { fail } from 'assert';
import { IcingaApi, Monitor, IHostJsonData, IServiceJsonData } from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { ImoinMonitorInstance } from '../scripts/Settings';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { SettingsBuilder } from './abstractHelpers/SettingsBuilder';

describe('IcingaApi', () => {
  const baseurl = 'testurl/v1/objects/hosts?attrs=display_name&attrs=last_check_result';

  function loadCallback(hostsdata: string, servicesdata: string) {
    return (url: string, user: string, passwd: string): Promise<string> => {
      if (url.substring(0, 24) === 'testurl/v1/objects/hosts') {
        return Promise.resolve(hostsdata);
      }
      if (url.substring(0, 27) === 'testurl/v1/objects/services') {
        return Promise.resolve(servicesdata);
      }

      Promise.reject('');
    };
  }

  function loadCallbackBuilder() {
    const hosts: { [name: string]: Monitor.Host } = {};
    const activeHost: Monitor.Host = null;
    const o = {
      activeHost,
      hosts,
      acknowledgement: false,
      host: (name: string) => {
        o.activeHost = o.hosts[name] = new Monitor.Host(name);
        return o;
      },
      down: () => {
        o.activeHost.setState('DOWN');
        return o;
      },
      hasBeenAcknowledged: () => {
        o.activeHost.hasBeenAcknowledged = true;
        return o;
      },
      build: () => {
        const hostdata = (): IHostJsonData => {
          return {
            results: Object.keys(o.hosts).map((hostkey) => {
              const host = o.hosts[hostkey];
              return {
                attrs: {
                  acknowledgement: host.hasBeenAcknowledged ? 1.0 : 0.0,
                  display_name: host.name,
                  last_check_result: {
                    state: host.getState() === 'UP' ? 0 : 1,
                    output: ''
                  }
                },
                name: host.name
              };
            })
          };
        };

        const servicedata = (): IServiceJsonData => {
          return {
            results: []
          };
        };

        return loadCallback(JSON.stringify(hostdata()), JSON.stringify(servicedata()));
      }
    };

    return o;
  }

  it('should use minimal query parameters for host request', (done) => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const requestUrls: string[] = [];
    const settings = SettingsBuilder.create('api1').build();
    e.loadCallback = (url, user, passwd) => {
      requestUrls.push(url);
      return Promise.reject('');
    };
    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then((v) => {
        expect(requestUrls).to.have.lengthOf(2);
        if (requestUrls.length > 0) {
          expect(requestUrls[0]).to.equal(baseurl + '&attrs=acknowledgement');
        }
        done();
      });
  });

  it('should set hasBeenAcknowledged on host', (done) => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const settings = SettingsBuilder.create('api1').build();
    FilterSettingsBuilder.with(settings)
      .filterOutAcknowledged();
    // tslint:disable-next-line:max-line-length
    e.loadCallback = loadCallback('{"results":[{"attrs":{"acknowledgement":0.0,"display_name":"www.qwirl.eu","last_check_result":{"active":true,"check_source":"www.qwirl.eu","command":["/usr/lib/nagios/plugins/check_ping","-H","127.0.0.1","-c","5000,100%","-w","3000,80%"],"execution_end":1520628025.6114690304,"execution_start":1520628021.6057910919,"exit_status":0.0,"output":"PING OK - Packet loss = 0%, RTA = 0.05 ms","performance_data":["rta=0.055000ms;3000.000000;5000.000000;0.000000","pl=0%;80;100;0"],"schedule_end":1520628025.6115729809,"schedule_start":1520628021.6053378582,"state":0.0,"type":"CheckResult","vars_after":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0},"vars_before":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0}}},"joins":{},"meta":{},"name":"www.qwirl.eu","type":"Host"},{"attrs":{"acknowledgement":1.0,"display_name":"KWN","last_check_result":{"active":true,"check_source":"www.qwirl.eu","command":["/usr/lib/nagios/plugins/check_ping","-H","kwn","-c","5000,100%","-w","3000,80%"],"execution_end":1520628020.5914731026,"execution_start":1520628016.5557351112,"exit_status":0.0,"output":"PING OK - Packet loss = 0%, RTA = 24.31 ms","performance_data":["rta=24.306000ms;3000.000000;5000.000000;0.000000","pl=0%;80;100;0"],"schedule_end":1520628020.5915489197,"schedule_start":1520628016.5553209782,"state":0.0,"type":"CheckResult","vars_after":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0},"vars_before":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0}}},"joins":{},"meta":{},"name":"KWN","type":"Host"}]}', '{"results": []}');
    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then((v) => {
        expect(v.hosts).to.have.lengthOf(2);
        if (v.hosts.length > 1) {
          expect(v.hosts[0].name).to.equal('www.qwirl.eu');
          expect(v.hosts[0].hasBeenAcknowledged).to.equal(false);
          expect(v.hosts[1].hasBeenAcknowledged).to.equal(true);
        }
        done();
      });
  });

  it('should not set hasBeenAcknowledged on host when attribute is not in response', (done) => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const settings = SettingsBuilder.create('api1').build();
    FilterSettingsBuilder.with(settings)
      .filterOutAcknowledged();
    // tslint:disable-next-line:max-line-length
    e.loadCallback = loadCallback('{"results":[{"attrs":{"display_name":"www.qwirl.eu","last_check_result":{"active":true,"check_source":"www.qwirl.eu","command":["/usr/lib/nagios/plugins/check_ping","-H","127.0.0.1","-c","5000,100%","-w","3000,80%"],"execution_end":1520628025.6114690304,"execution_start":1520628021.6057910919,"exit_status":0.0,"output":"PING OK - Packet loss = 0%, RTA = 0.05 ms","performance_data":["rta=0.055000ms;3000.000000;5000.000000;0.000000","pl=0%;80;100;0"],"schedule_end":1520628025.6115729809,"schedule_start":1520628021.6053378582,"state":0.0,"type":"CheckResult","vars_after":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0},"vars_before":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0}}},"joins":{},"meta":{},"name":"www.qwirl.eu","type":"Host"},{"attrs":{"display_name":"KWN","last_check_result":{"active":true,"check_source":"www.qwirl.eu","command":["/usr/lib/nagios/plugins/check_ping","-H","kwn","-c","5000,100%","-w","3000,80%"],"execution_end":1520628020.5914731026,"execution_start":1520628016.5557351112,"exit_status":0.0,"output":"PING OK - Packet loss = 0%, RTA = 24.31 ms","performance_data":["rta=24.306000ms;3000.000000;5000.000000;0.000000","pl=0%;80;100;0"],"schedule_end":1520628020.5915489197,"schedule_start":1520628016.5553209782,"state":0.0,"type":"CheckResult","vars_after":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0},"vars_before":{"attempt":1.0,"reachable":true,"state":0.0,"state_type":1.0}}},"joins":{},"meta":{},"name":"KWN","type":"Host"}]}', '{"results": []}');
    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then((v) => {
        expect(v.hosts).to.have.lengthOf(2);
        if (v.hosts.length > 1) {
          expect(v.hosts[0].name).to.equal('www.qwirl.eu');
          expect(v.hosts[0].hasBeenAcknowledged).to.equal(false);
          expect(v.hosts[1].hasBeenAcknowledged).to.equal(false);
        }
        done();
      });
  });
});
