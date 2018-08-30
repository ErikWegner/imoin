import * as fs from 'fs';
import 'mocha';
import { expect } from 'chai';
import { IcingaCgi } from '../scripts/monitors';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';
import { ImoinMonitorInstance } from '../scripts/Settings';
import { fail } from 'assert';

describe('icingacgi', () => {
  it('should fetchStatus for 1.10', (done) => {
    fs.readFile('test/data/icinga1/icingacgi_1_10.json', (err, data) => {
      if (err) {
        fail(err.message);
        done();
        return;
      }
      const e = new MockAbstractEnvironment();
      const u = new IcingaCgi();
      const settings: ImoinMonitorInstance = {
        icingaversion: 'cgi',
        instancelabel: 'unittest',
        url: 'testurl',
        timerPeriod: 5,
        username: 'user',
        password: 'pass',
      };
      e.loadCallback = () => {
        return Promise.resolve(data.toString());
      };
      u.init(e, settings, 0);
      u.fetchStatus().then((monitordata) => {
        expect(monitordata.hosts.length).to.be.greaterThan(0);
        done();
      }).catch((err2) => {
        fail(err2);
        done();
      });
    });
  });
});
