import { expect } from 'chai';
import 'mocha';

import { IEnvironment } from '../scripts/IEnvironment';
import { resolveMonitor } from '../scripts/main';
import {
  IcingaApi,
  IcingaCgi,
  NagiosCore,
  NagiosHtml,
} from '../scripts/monitors';
import {
  IcingaOptionsVersion,
  ImoinMonitorInstance,
} from '../scripts/Settings';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';

describe('main', () => {
  describe('resolveMonitor', () => {
    let e: IEnvironment;

    beforeEach(() => {
      e = new MockAbstractEnvironment();
    });
    function buildInstance(v: IcingaOptionsVersion): ImoinMonitorInstance {
      return {
        instancelabel: '',
        timerPeriod: 1,
        icingaversion: v,
        url: '',
        username: '',
        password: '',
      };
    }

    it('should resolve cgi', () => {
      const i = buildInstance('cgi');
      const r = resolveMonitor(e, i, 0);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(IcingaCgi);
    });

    it('should resolve api1', () => {
      const i = buildInstance('api1');
      const r = resolveMonitor(e, i, 0);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(IcingaApi);
    });

    it('should resolve nagioscore', () => {
      const i = buildInstance('nagioscore');
      const r = resolveMonitor(e, i, 0);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(NagiosCore);
    });

    it('should resolve nagioshtml', () => {
      const i = buildInstance('nagioshtml');
      const r = resolveMonitor(e, i, 0);
      expect(r).to.be.not.null;
      expect(r).to.be.an.instanceOf(NagiosHtml);
    });
  });
});
