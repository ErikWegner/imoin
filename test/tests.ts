import 'mocha';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';

import { NagiosCore } from '../scripts/monitors';
import { IEnvironment } from '../scripts/IEnvironment';
import { Settings } from '../scripts/Settings';

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
      'unittest instance',
      0,
      'nagioscore',
      'http://unittest',
      'mochauser',
      'mochapassword'
    );
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

    monitor = new NagiosCore(mockEnv, settings, 0);
  });

  function fetchDataAndPrepareTestEnvironment(): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile('test/data/nagioscore/hostlist.json', (err, hostlist) => {
        if (err) {
          reject(err);
        }
        fs.readFile(
          'test/data/nagioscore/servicelist.json',
          (err2, servicelist) => {
            if (err2) {
              reject(err2);
            }
            const p1 = new Promise((resolve) => {
              resolve(hostlist.toString());
            });
            const p2 = new Promise((resolve) => {
              resolve(servicelist.toString());
            });

            mockEnvLoad.onFirstCall().returns(p1).onSecondCall().returns(p2);

            resolve();
          }
        );
      });
    });
  }

  it('should load hosts and services', async () => {
    await fetchDataAndPrepareTestEnvironment();
    const data = await monitor.fetchStatus();
    expect(data).to.have.property('hosts').with.lengthOf(54);
  });

  it('should process hosts', async () => {
    await fetchDataAndPrepareTestEnvironment();
    const data = await monitor.fetchStatus();
    const firsthost = data.hosts[0];
    expect(firsthost.name).to.equal('Firewall');
    expect(firsthost.getState()).to.equal('UP');
    const downhost = data.hosts[14];
    expect(downhost.name).to.equal('europa.nagios.local');
    expect(downhost.getState()).to.equal('DOWN');
  });

  it('should process services', async () => {
    await fetchDataAndPrepareTestEnvironment();
    const data = await monitor.fetchStatus();
    const host = data.hosts[1];
    expect(host.name).to.equal('Log-Server.nagios.local');
    expect(host).to.have.property('services').with.lengthOf(23);
  });

  it('should process services WARNING', async () => {
    await fetchDataAndPrepareTestEnvironment();
    const data = await monitor.fetchStatus();
    const host = data.hosts[1];
    const service1 = host.services[0];
    expect(service1.name).to.equal('/ Disk Usage');
    expect(service1.getState()).to.equal('WARNING');
  });
});
