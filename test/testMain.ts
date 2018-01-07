import * as fs from 'fs';
import 'mocha';
import { fail } from 'assert';
import { assert, expect } from 'chai';

import { resolveMonitor } from '../scripts/main';
import { ImoinMonitorInstance, IcingaOptionsVersion } from '../scripts/Settings';
import { IcingaCgi } from '../scripts/icingacgi';
import { IcingaApi } from '../scripts/icingaapi';
import { NagiosCore } from '../scripts/nagioscore';
import { NagiosHtml } from '../scripts/nagioshtml';

describe('main', () => {
  describe('resolveMonitor', () => {
    function buildInstance(v: IcingaOptionsVersion): ImoinMonitorInstance {
      return {
        instancelabel: '',
        timerPeriod: 1,
        icingaversion: v,
        url: '',
        username: '',
        password: '',
      }
    }

    it('should resolve cgi', () => {
      const i = buildInstance('cgi')
      const r = resolveMonitor(i);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(IcingaCgi);
    });

    it('should resolve api1', () => {
      const i = buildInstance('api1')
      const r = resolveMonitor(i);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(IcingaApi);
    });

    it('should resolve nagioscore', () => {
      const i = buildInstance('nagioscore')
      const r = resolveMonitor(i);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(NagiosCore);
    });

    it('should resolve nagioshtml', () => {
      const i = buildInstance('nagioshtml')
      const r = resolveMonitor(i);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(NagiosHtml);
    });

  });
});
