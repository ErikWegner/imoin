import 'mocha';
import { assert, expect } from 'chai';
import { NagiosCore } from '../scripts/monitors';
import { IEnvironment } from '../scripts/IEnvironment';
import * as sinon from 'sinon';
import { Settings } from '../scripts/Settings';
import * as fs from 'fs';

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
  });
});

describe('nagioscore', () => {
  let monitor: NagiosCore;
  let mockEnvLoad: sinon.SinonStub;
  let mockEnv: IEnvironment;

  beforeEach(() => {
    const settings = Settings.paramsToInstance(
      'unittest instance', 0, 'nagioscore', 'http://unittest', 'mochauser', 'mochapassword');
    mockEnvLoad = sinon.stub();
    mockEnv = {
      initTimer: sinon.spy(),
      stopTimer: sinon.spy(),
      displayStatus: sinon.spy(),
      loadSettings: sinon.spy(),
      onSettingsChanged: sinon.spy(),
      post: sinon.spy(),
      onUICommand: sinon.spy(),
      load: mockEnvLoad,
      registerMonitorInstance: sinon.spy(),
    };

    monitor = new NagiosCore();
    monitor.init(mockEnv, settings, 0);
  });

  function fetchDataAndRunTests(testexecutions: () => void) {
    fs.readFile('test/data/nagioscore/hostlist.json', (err: any, hostlist: any) => {
      if (err) {
        throw err;
      }
      fs.readFile('test/data/nagioscore/servicelist.json', (err2: any, servicelist: any) => {
        if (err2) {
          throw err2;
        }
        const p1 = new Promise((resolve, reject) => {
          resolve(hostlist.toString());
        });
        const p2 = new Promise((resolve, reject) => {
          resolve(servicelist.toString());
        });

        mockEnvLoad
          .onFirstCall().returns(p1)
          .onSecondCall().returns(p2);

        testexecutions();
      });
    });
  }

  it('should load hosts and services', (done) => {
    fetchDataAndRunTests(() => {
      monitor.fetchStatus().then((data) => {
        expect(data).to.have.property('hosts').with.lengthOf(54);
        done();
      });
    });
  });

  it('should process hosts', (done) => {
    fetchDataAndRunTests(() => {
      monitor.fetchStatus().then((data) => {
        const firsthost = data.hosts[0];
        expect(firsthost.name).to.equal('Firewall');
        expect(firsthost.getState()).to.equal('UP');
        const downhost = data.hosts[14];
        expect(downhost.name).to.equal('europa.nagios.local');
        expect(downhost.getState()).to.equal('DOWN');
        done();
      });
    });
  });

  it('should process services', (done) => {
    fetchDataAndRunTests(() => {
      monitor.fetchStatus().then((data) => {
        const host = data.hosts[1];
        expect(host.name).to.equal('Log-Server.nagios.local');
        expect(host).to.have.property('services').with.lengthOf(23);
        done();
      });
    });
  });

  it('should process services WARNING', (done) => {
    fetchDataAndRunTests(() => {
      monitor.fetchStatus().then((data) => {
        const host = data.hosts[1];
        const service1 = host.services[0];
        expect(service1.name).to.equal('/ Disk Usage');
        expect(service1.getState()).to.equal('WARNING');
        done();
      });
    });
  });
});
