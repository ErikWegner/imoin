import 'mocha';
import { expect } from 'chai';
import { fail } from 'assert';
import { IcingaApi } from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { SettingsBuilder } from './abstractHelpers/SettingsBuilder';
import { LoadCallbackBuilder } from './abstractHelpers/LoadCallbackBuilder';
import { filterSettingsTests } from './filterSettingsTestsCommons';

describe('IcingaApi', () => {
  const baseurl = 'testurl/v1/objects/###?' +
    'attrs=display_name&attrs=last_check_result';

  function loadCallback(hostsdata: string, servicesdata: string) {
    return (url: string): Promise<string> => {
      if (url.substring(0, 24) === 'testurl/v1/objects/hosts') {
        return Promise.resolve(hostsdata);
      }
      if (url.substring(0, 27) === 'testurl/v1/objects/services') {
        return Promise.resolve(servicesdata);
      }

      return Promise.reject('');
    };
  }

  it('should use minimal query parameters for host request', () => {
    const e = new MockAbstractEnvironment();
    const requestUrls: string[] = [];
    const settings = SettingsBuilder.create('api1').build();
    e.loadCallback = (url) => {
      requestUrls.push(url);
      return Promise.reject('');
    };
    const u = new IcingaApi(e, settings, 0);
    return u
      .fetchStatus()
      .then(() => {
        expect(requestUrls).to.have.lengthOf(2);
        if (requestUrls.length > 0) {
          expect(requestUrls[0]).to.equal(baseurl.replace('###', 'hosts'));
        }
      });
  });

  it('should use minimal query parameters for service request', () => {
    const e = new MockAbstractEnvironment();
    const requestUrls: string[] = [];
    const settings = SettingsBuilder.create('api1').build();
    e.loadCallback = (url) => {
      requestUrls.push(url);
      return Promise.reject('');
    };
    const u = new IcingaApi(e, settings, 0);
    return u
      .fetchStatus()
      .then(() => {
        expect(requestUrls).to.have.lengthOf(2);
        if (requestUrls.length > 0) {
          expect(requestUrls[1]).to.equal(baseurl.replace('###', 'services'));
        }
      });
  });

  Object.keys(filterSettingsTests).forEach((description) => {
    const options = filterSettingsTests[description];
    describe(description, () => {

      function buildSettings() {
        const settings = SettingsBuilder.create('api1').build();
        FilterSettingsBuilder.with(settings)
          .setup(options.setupFilterSettingsBuilder);
        return settings;
      }

      it('should add attribute to host query', () => {
        const e = new MockAbstractEnvironment();
        const settings = buildSettings();

        const requestUrls: string[] = [];
        e.loadCallback = (url) => {
          requestUrls.push(url);
          return Promise.reject('');
        };
        const u = new IcingaApi(e, settings, 0);
        return u
          .fetchStatus()
          .then(() => {
            expect(requestUrls).to.have.lengthOf(2);
            if (requestUrls.length > 0) {
              const expectedUrl = baseurl.replace('###', 'hosts') +
                '&attrs=' +
                options.hostQueryParameter;
              expect(requestUrls[0]).to.equal(expectedUrl);
            }
          });
      });

      it('should add attribute to service query', () => {
        const e = new MockAbstractEnvironment();
        const settings = buildSettings();

        const requestUrls: string[] = [];
        e.loadCallback = (url) => {
          requestUrls.push(url);
          return Promise.reject('');
        };
        const u = new IcingaApi(e, settings, 0);
        return u
          .fetchStatus()
          .then(() => {
            expect(requestUrls).to.have.lengthOf(2);
            if (requestUrls.length > 0) {
              const expectedUrl = baseurl.replace('###', 'services') +
                '&attrs=' +
                options.serviceQueryParameter;
              expect(requestUrls[1]).to.equal(expectedUrl);
            }
          });
      });

      it('should set ' + options.hostProperty + ' on host', () => {
        const e = new MockAbstractEnvironment();
        const settings = buildSettings();

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .setup(options.setupHost)
          .Host('H2')
          .BuildCallbacks('api1');

        e.loadCallback = loadCallback(data[0], data[1]);

        const u = new IcingaApi(e, settings, 0);
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

      it('should not set ' + description + ' on host when attribute is not in response', () => {
        const e = new MockAbstractEnvironment();
        const settings = buildSettings();

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .Host('H2')
          .BuildCallbacks('api1');

        e.loadCallback = loadCallback(data[0], data[1]);
        const u = new IcingaApi(e, settings, 0);
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

      it('should set ' + description + ' on service', () => {
        const e = new MockAbstractEnvironment();
        const settings = buildSettings();

        const data = new LoadCallbackBuilder()
          .Host('H1')
          .Service('S1', options.setupService)
          .Service('S2', () => { /* no op */ })
          .BuildCallbacks('api1');

        e.loadCallback = loadCallback(data[0], data[1]);

        const u = new IcingaApi(e, settings, 0);
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
