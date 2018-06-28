import 'mocha';
import { expect } from 'chai';
import { fail } from 'assert';
import { IcingaApi, Monitor } from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { SettingsBuilder } from './abstractHelpers/SettingsBuilder';
import { LoadCallbackBuilder } from './abstractHelpers/LoadCallbackBuilder';
import { ServiceBuilder } from './abstractHelpers/ServiceBuilder';

describe('IcingaApi', () => {
  const baseurl = 'testurl/v1/objects/###?' +
    'attrs=display_name&attrs=last_check_result&attrs=acknowledgement';

  function loadCallback(hostsdata: string, servicesdata: string) {
    return (url: string): Promise<string> => {
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
    e.loadCallback = (url) => {
      requestUrls.push(url);
      return Promise.reject('');
    };
    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then(() => {
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
    e.loadCallback = (url) => {
      requestUrls.push(url);
      return Promise.reject('');
    };
    u.init(e, settings, 0);
    u
      .fetchStatus()
      .then(() => {
        expect(requestUrls).to.have.lengthOf(2);
        if (requestUrls.length > 0) {
          expect(requestUrls[1]).to.equal(baseurl.replace('###', 'services'));
        }
        done();
      });
  });

  const filterSettingsTests: {
    [filterName: string]: {
      setupFilterSettingsBuilder: (fsb: FilterSettingsBuilder) => void,
      setupHost: (lcb: LoadCallbackBuilder) => void,
      hostProperty: keyof Monitor.Host,
      setupService: (sb: ServiceBuilder) => void,
      serviceProperty: keyof Monitor.Service,
    }
  } = {
    hasBeenAcknowledged: {
      setupFilterSettingsBuilder: (sb) => sb.filterOutAcknowledged(),
      setupHost: (lcb) => lcb.HasBeenAcknowledged(),
      hostProperty: 'hasBeenAcknowledged',
      setupService: (sb) => sb.hasBeenAcknowledged(),
      serviceProperty: 'hasBeenAcknowledged',
    },
    softState: {
      setupFilterSettingsBuilder: (sb) => sb.filterOutSoftStates(),
      setupHost: (lcb) => lcb.softState(),
      hostProperty: 'isInSoftState',
      setupService: (sb) => sb.inSoftState(),
      serviceProperty: 'isInSoftState',
    },
    notificationDisabled: {
      setupFilterSettingsBuilder: (sb) => sb.filterOutNotificationDisabled(),
      setupHost: (lcb) => lcb.disableNotifications(),
      hostProperty: 'notificationsDisabled',
      setupService: (sb) => sb.notificationsDisabled(),
      serviceProperty: 'notificationsDisabled',
    },
  };

  Object.keys(filterSettingsTests).forEach((description) => {
    const options = filterSettingsTests[description];
    describe(description, () => {

      it('should set flag on host', () => {
        const e = new MockAbstractEnvironment();
        const u = new IcingaApi();
        const settings = SettingsBuilder.create('api1').build();
        FilterSettingsBuilder.with(settings)
          .setup(options.setupFilterSettingsBuilder);

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .setup(options.setupHost)
          .Host('H2')
          .Build('api1');

        e.loadCallback = loadCallback(data[0], data[1]);

        u.init(e, settings, 0);
        return u
          .fetchStatus()
          .then((v) => {
            expect(v.hosts).to.have.lengthOf(2);
            if (v.hosts.length > 1) {
              expect(v.hosts[0].name).to.equal('H1');
              expect(v.hosts[0][options.hostProperty]).to.equal(true);
              expect(v.hosts[1][options.hostProperty]).to.equal(false);
            }
          });
      });

      it('should not set notificationDisabled on host when attribute is not in response', () => {
        const e = new MockAbstractEnvironment();
        const u = new IcingaApi();
        const settings = SettingsBuilder.create('api1').build();
        FilterSettingsBuilder.with(settings)
          .filterOutSoftStates();

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .Host('H2')
          .Build('api1');

        e.loadCallback = loadCallback(data[0], data[1]);
        u.init(e, settings, 0);
        return u
          .fetchStatus()
          .then((v) => {
            expect(v.hosts).to.have.lengthOf(2);
            if (v.hosts.length > 1) {
              expect(v.hosts[0].name).to.equal('H1');
              expect(v.hosts[0][options.hostProperty]).to.equal(false);
              expect(v.hosts[1][options.hostProperty]).to.equal(false);
            }
          });
      });

      it('should set flag on service', () => {
        const e = new MockAbstractEnvironment();
        const u = new IcingaApi();
        const settings = SettingsBuilder.create('api1').build();
        FilterSettingsBuilder.with(settings)
          .setup(options.setupFilterSettingsBuilder);

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .Service('S1', options.setupService)
          .Service('S2', () => { /* no op */ })
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
