import { expect } from 'chai';
import * as fs from 'fs';
import 'mocha';

import { NagiosHtml } from '../scripts/monitors/index.js';
import { ImoinMonitorInstance } from '../scripts/Settings.js';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment.js';

describe('NagiosHtml', () => {
  it('should fetch status', (done) => {
    fs.readFile('test/data/nagioshtml/status_hosts.html', (err, hostshtml) => {
      if (err) {
        expect.fail(err.message);
      }

      fs.readFile(
        'test/data/nagioshtml/status_services.html',
        (err2, serviceshtml) => {
          if (err2) {
            expect.fail(err2.message);
          }

          const e = new MockAbstractEnvironment();
          const settings: ImoinMonitorInstance = {
            icingaversion: 'nagioshtml',
            instancelabel: 'unittest',
            url: '/unittest',
            timerPeriod: 5,
            username: 'user',
            password: 'pass',
          };
          const u = new NagiosHtml(e, settings, 0);
          e.loadCallback = (url): Promise<string> => {
            if (
              url ===
              '/unittest/cgi-bin/status.cgi?hostgroup=all&style=hostdetail&limit=0'
            ) {
              return Promise.resolve(hostshtml.toString());
            }
            if (
              url ===
              '/unittest/cgi-bin/status.cgi?hostgroup=all&style=detail&limit=0'
            ) {
              return Promise.resolve(serviceshtml.toString());
            }
            const errtext = 'Url ' + url + ' not found';
            console.log(errtext);
            return Promise.reject(errtext);
          };
          u.fetchStatus()
            .then((monitordata) => {
              expect(monitordata.hosts.length).to.equal(54);
              expect(
                monitordata.hosts.filter((hf) => hf.getState() !== 'UP').length
              ).to.equal(8);
              expect(monitordata.hosts[0].checkresult).to.equal(
                'OK - 127.0.0.1: rta 0.023ms, lost 0%'
              );

              const h = monitordata.hosts[1];
              expect(h.name).to.equal('Log-Server.nagios.local');
              expect(h.services.length).to.equal(23);
              expect(h.services[0].name).to.equal('/ Disk Usage');
              expect(h.services[0].getState()).to.equal('CRITICAL');

              expect(h.services[1].name).to.equal('Apache 404 Errors');
              expect(h.services[1].getState()).to.equal('OK');
              expect(h.services[1].checkresult).to.equal(
                'OK: 17 matching entries found'
              );
              done();
            })
            .catch((err3: unknown) => {
              expect.fail(err3 as string);
              done();
            });
        }
      );
    });
  });

  it('should decode html entities', (done) => {
    const hostshtml =
      "extinfo.cgi?type=1&host=Digital-Library' title='127.0.0.1'>Digital-Library</a>&nbsp;</td></tr></table></td>" +
      "<td align=right valign=center><table border=0 cellpadding=0 cellspacing=0><tr><td><a href='status.cgi?host=Digital-Library'>" +
      "<img src='/nagios/images/status2.gif' border=0 alt='View Service Details For This Host' title='View Service Details For This Host'></a></td>" +
      "</tr></table></td></tr></table></td><td class='statusHOSTUP'>UP</td><td class='statusEven' nowrap>01-07-2018 08:36:52</td>" +
      "<td class='statusEven' nowrap> 0d  0h 36m 36s+</td><td class='statusEven' valign='center'>OK - 127.0.0.1: rta 0.023ms, lost 0%&nbsp;</td>";

    fs.readFile(
      'test/data/nagioshtml/services_entities.html',
      (err, serviceshtml) => {
        if (err) {
          expect.fail(err.message);
          done();
          return;
        }

        const e = new MockAbstractEnvironment();
        const settings: ImoinMonitorInstance = {
          icingaversion: 'nagioshtml',
          instancelabel: 'unittest',
          url: '/unittest',
          timerPeriod: 5,
          username: 'user',
          password: 'pass',
        };
        const u = new NagiosHtml(e, settings, 0);
        e.loadCallback = (url): Promise<string> => {
          if (
            url ===
            '/unittest/cgi-bin/status.cgi?hostgroup=all&style=hostdetail&limit=0'
          ) {
            return Promise.resolve(hostshtml);
          }
          if (
            url ===
            '/unittest/cgi-bin/status.cgi?hostgroup=all&style=detail&limit=0'
          ) {
            return Promise.resolve(serviceshtml.toString());
          }
          const errtext = 'Url ' + url + ' not found';
          console.log(errtext);
          return Promise.reject(errtext);
        };
        u.fetchStatus()
          .then((monitordata) => {
            if (monitordata.hosts.length < 1) {
              expect.fail('No host detected');
              done();
              return;
            }
            expect(monitordata.hosts.length).to.equal(1);
            const h = monitordata.hosts[0];
            expect(h.name).to.equal('Digital-Library');
            expect(h.services.length).to.equal(1);
            expect(h.services[0].name).to.equal('INDEXER');
            expect(h.services[0].checkresult).to.equal(
              "HTTP CRITICAL: Status line output matched \"200\" - string 'indexer: running' not found on '[URL_REMOVED]' - 878 bytes in 0.520 second response time"
            );
            done();
          })
          .catch((err2) => {
            expect.fail(err2 as string);
          });
      }
    );
  });
});
