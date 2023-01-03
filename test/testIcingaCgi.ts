import { expect } from 'chai';
import * as fs from 'fs';
import 'mocha';

import { IcingaCgi } from '../scripts/monitors/index.js';
import { ImoinMonitorInstance } from '../scripts/Settings.js';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment.js';

describe('icingacgi', () => {
  it('should fetchStatus for 1.10', (done) => {
    fs.readFile('test/data/icinga1/icingacgi_1_10.json', (err, data) => {
      if (err) {
        expect.fail(err.message);
        done();
        return;
      }
      const e = new MockAbstractEnvironment();
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
      const u = new IcingaCgi(e, settings, 0);
      u.fetchStatus()
        .then((monitordata) => {
          expect(monitordata.hosts.length).to.be.greaterThan(0);
          done();
        })
        .catch((err2) => {
          expect.fail(err2 as string);
          done();
        });
    });
  });
});
