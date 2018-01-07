import * as fs from 'fs';
import 'mocha';
import { fail } from 'assert';
import { assert, expect } from 'chai';

import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { NagiosHtml } from '../scripts/nagioshtml';
import { ImoinMonitorInstance } from '../scripts/Settings';

describe('NagiosHtml', () => {
  it('should fetch status', (done) => {
    fs.readFile('test/data/nagioshtml/status_hosts.html', (err, hostshtml) => {
      if (err) {
        fail(err.message);
        done();
        return;
      }

      fs.readFile('test/data/nagioshtml/status_services.html', (err, serviceshtml) => {
        if (err) {
          fail(err.message);
          done();
          return;
        }
        
        const e = new MockAbstractEnvironment();
        const u = new NagiosHtml();
        e.loadCallback = (url, user, passwd): Promise<string> => {
          if (url === '/unittest/cgi-bin/status.cgi?hostgroup=all&style=hostdetail&limit=0') {
            return Promise.resolve(hostshtml.toString());
          }
          if (url === '/unittest/cgi-bin/status.cgi?hostgroup=all&style=detail&limit=0') {
            return Promise.resolve(serviceshtml.toString());
          }
          const errtext = 'Url ' + url + ' not found';
          console.log(errtext);
          return Promise.reject(errtext);
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
        u.fetchStatus().then((monitordata) => {
          expect(monitordata.hosts.length).to.equal(54);
          expect(monitordata.hosts.filter((h) => h.status !== 'UP').length).to.equal(8);
          expect(monitordata.hosts[0].checkresult).to.equal('OK - 127.0.0.1: rta 0.023ms, lost 0%');
          done();
        }).catch((err) => {
          fail(err);
          done();
        });
      });
    })
  })
});
