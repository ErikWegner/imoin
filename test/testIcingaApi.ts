import 'mocha';
import { assert, expect } from 'chai';
import { fail } from 'assert';
import { IcingaApi, Monitor, IHostJsonData, IServiceJsonData } from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { ImoinMonitorInstance } from '../scripts/Settings';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { SettingsBuilder } from './abstractHelpers/SettingsBuilder';
import { ServiceBuilder } from './abstractHelpers/ServiceBuilder';
import { LoadCallbackBuilder } from './abstractHelpers/LoadCallbackBuilder';

describe('IcingaApi', () => {
  const baseurl = 'testurl/v1/objects/###?' +
    'attrs=display_name&attrs=last_check_result&attrs=acknowledgement';

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
          expect(requestUrls[0]).to.equal(baseurl.replace('###', 'hosts'));
        }
        done();
      });
  });

  it('should use minimal query parameters for service request', (done) => {
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
          expect(requestUrls[1]).to.equal(baseurl.replace('###', 'services'));
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

  it('should set hasBeenAcknowledged on service', (done) => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const settings = SettingsBuilder.create('api1').build();
    FilterSettingsBuilder.with(settings)
      .filterOutAcknowledged();

    const data = new LoadCallbackBuilder()
      .Host('H1')
      .Service('S1', (sb) => { sb.hasBeenAcknowledged(); })
      .Service('S2', (sb) => { /* no setup */ })
      .Build('api1');

    e.loadCallback = loadCallback(data[0], data[1]);

    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then((v) => {
        expect(v.hosts).to.have.lengthOf(1);
        if (v.hosts.length > 0) {
          expect(v.hosts[0].name).to.equal('H1');
          expect(v.hosts[0].hasBeenAcknowledged).to.equal(false);
          const services = v.hosts[0].services;
          expect(services).to.have.lengthOf(2);
          if (services.length > 1) {
            expect(services[0].hasBeenAcknowledged).to.equal(true);
            expect(services[1].hasBeenAcknowledged).to.equal(false);
          } else {
            fail('Services missing');
          }
        } else {
          fail('No host');
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

  it('should set hasBeenAcknowledged on service', (done) => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const settings = SettingsBuilder.create('api1').build();
    FilterSettingsBuilder.with(settings)
      .filterOutAcknowledged();

    const data = new LoadCallbackBuilder()
      .Host('H1')
      .Service('S1', (sb) => { sb.hasBeenAcknowledged(); })
      .Service('S2', (sb) => { /* no setup */ })
      .Build('api1');

    e.loadCallback = loadCallback(data[0], data[1]);

    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then((v) => {
        expect(v.hosts).to.have.lengthOf(1);
        if (v.hosts.length > 0) {
          expect(v.hosts[0].name).to.equal('H1');
          expect(v.hosts[0].hasBeenAcknowledged).to.equal(false);
          const services = v.hosts[0].services;
          expect(services).to.have.lengthOf(2);
          if (services.length > 1) {
            expect(services[0].hasBeenAcknowledged).to.equal(true);
            expect(services[1].hasBeenAcknowledged).to.equal(false);
          } else {
            fail('Services missing');
          }
        } else {
          fail('No host');
        }
        done();
      });
  });

  it('should set state on host', (done) => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const settings = SettingsBuilder.create('api1').build();
    FilterSettingsBuilder.with(settings)
      .filterOutSoftStates();
    e.loadCallback = loadCallback(JSON.stringify({
      results: [{
        attrs: {
          display_name: 'www.qwirl.eu',
          last_check_result: {
            active: true,
            check_source: 'www.qwirl.eu',
            command: [
              '/usr/lib/nagios/plugins/check_ping',
              '-H',
              '127.0.0.1',
              '-c',
              '5000,100%',
              '-w',
              '3000,80%'],
            execution_end: 1520628025.6114690304,
            execution_start: 1520628021.6057910919,
            exit_status: 0.0,
            output: 'PING OK - Packet loss = 0%, RTA = 0.05 ms',
            performance_data: [
              'rta=0.055000ms;3000.000000;5000.000000;0.000000',
              'pl=0%;80;100;0'],
            schedule_end: 1520628025.6115729809,
            schedule_start: 1520628021.6053378582,
            state: 0.0,
            type: 'CheckResult',
            vars_after: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            },
            vars_before: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            }
          },
          state_type: 1
        },
        joins: {},
        meta: {},
        name: 'www.qwirl.eu',
        type: 'Host'
      },
      {
        attrs: {
          display_name: 'KWN',
          last_check_result: {
            active: true,
            check_source: 'www.qwirl.eu',
            command: [
              '/usr/lib/nagios/plugins/check_ping',
              '-H',
              'kwn',
              '-c', '5000,100%',
              '-w', '3000,80%'],
            execution_end: 1520628020.5914731026,
            execution_start: 1520628016.5557351112,
            exit_status: 0.0,
            output: 'PING OK - Packet loss = 0%, RTA = 24.31 ms',
            performance_data: [
              'rta=24.306000ms;3000.000000;5000.000000;0.000000',
              'pl=0%;80;100;0'],
            schedule_end: 1520628020.5915489197,
            schedule_start: 1520628016.5553209782,
            state: 0.0,
            type: 'CheckResult',
            vars_after: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            },
            vars_before: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            }
          },
          state_type: 0
        },
        joins: {},
        meta: {},
        name: 'KWN',
        type: 'Host'
      }]
    }), JSON.stringify({ results: [] }));
    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then((v) => {
        expect(v.hosts).to.have.lengthOf(2);
        if (v.hosts.length > 1) {
          expect(v.hosts[0].name).to.equal('www.qwirl.eu');
          expect(v.hosts[0].isInSoftState).to.equal(false);
          expect(v.hosts[1].isInSoftState).to.equal(true);
        }
        done();
      });
  });

  it('should not set state on host when attribute is not in response', (done) => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const settings = SettingsBuilder.create('api1').build();
    FilterSettingsBuilder.with(settings)
      .filterOutSoftStates();
    e.loadCallback = loadCallback(JSON.stringify({
      results: [{
        attrs: {
          display_name: 'www.qwirl.eu',
          last_check_result: {
            active: true,
            check_source: 'www.qwirl.eu',
            command: [
              '/usr/lib/nagios/plugins/check_ping',
              '-H',
              '127.0.0.1',
              '-c',
              '5000,100%',
              '-w',
              '3000,80%'],
            execution_end: 1520628025.6114690304,
            execution_start: 1520628021.6057910919,
            exit_status: 0.0,
            output: 'PING OK - Packet loss = 0%, RTA = 0.05 ms',
            performance_data: [
              'rta=0.055000ms;3000.000000;5000.000000;0.000000',
              'pl=0%;80;100;0'],
            schedule_end: 1520628025.6115729809,
            schedule_start: 1520628021.6053378582,
            state: 0.0,
            type: 'CheckResult',
            vars_after: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            },
            vars_before: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            }
          }
        },
        joins: {},
        meta: {},
        name: 'www.qwirl.eu',
        type: 'Host'
      },
      {
        attrs: {
          display_name: 'KWN',
          last_check_result: {
            active: true,
            check_source: 'www.qwirl.eu',
            command: [
              '/usr/lib/nagios/plugins/check_ping',
              '-H',
              'kwn',
              '-c', '5000,100%',
              '-w', '3000,80%'],
            execution_end: 1520628020.5914731026,
            execution_start: 1520628016.5557351112,
            exit_status: 0.0,
            output: 'PING OK - Packet loss = 0%, RTA = 24.31 ms',
            performance_data: [
              'rta=24.306000ms;3000.000000;5000.000000;0.000000',
              'pl=0%;80;100;0'],
            schedule_end: 1520628020.5915489197,
            schedule_start: 1520628016.5553209782,
            state: 0.0,
            type: 'CheckResult',
            vars_after: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            },
            vars_before: {
              attempt: 1.0,
              reachable: true,
              state: 0.0,
              state_type: 1.0
            }
          }
        },
        joins: {},
        meta: {},
        name: 'KWN',
        type: 'Host'
      }]
    }), JSON.stringify({ results: [] }));
    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then((v) => {
        expect(v.hosts).to.have.lengthOf(2);
        if (v.hosts.length > 1) {
          expect(v.hosts[0].name).to.equal('www.qwirl.eu');
          expect(v.hosts[0].isInSoftState).to.equal(false);
          expect(v.hosts[1].isInSoftState).to.equal(false);
        }
        done();
      });
  });

  it('should set state on service', () => {
    const e = new MockAbstractEnvironment();
    const u = new IcingaApi();
    const settings = SettingsBuilder.create('api1').build();
    FilterSettingsBuilder.with(settings)
      .filterOutSoftStates();

    const data = new LoadCallbackBuilder()
      .Host('H1')
      .Service('S1', (sb) => { sb.inSoftState(); })
      .Service('S2', (sb) => { /* no setup */ })
      .Build('api1');

    e.loadCallback = loadCallback(data[0], data[1]);

    u.init(e, settings, 0);
    // https://github.com/domenic/chai-as-promised/issues/112#issuecomment-114906474
    return u
      .fetchStatus()
      .then((v) => {
        expect(v.hosts).to.have.lengthOf(1);
        if (v.hosts.length > 0) {
          expect(v.hosts[0].name).to.equal('H1');
          expect(v.hosts[0].hasBeenAcknowledged).to.equal(false);
          const services = v.hosts[0].services;
          expect(services).to.have.lengthOf(2);
          if (services.length > 1) {
            expect(services[0].isInSoftState).to.equal(true);
            expect(services[1].isInSoftState).to.equal(false);
          } else {
            fail('Services missing');
          }
        } else {
          fail('No host');
        }
      });
  });
});
