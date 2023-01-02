import { expect } from 'chai';
import 'mocha';

import { AbstractWebExtensionsEnvironment } from '../scripts/AbstractWebExtensionsEnvironment';
import { Status } from './monitors';

describe('AbstractWebExtensionsEnvironment', () => {
  it('should remove slashes', () => {
    const i1 = '{"url":"http://www.example.org/nagios/"}';
    const i2 = '{"url":"http://www.icinga.org/"}';
    const i = { instances: '[' + i1 + ',' + i2 + ']' };
    const r = AbstractWebExtensionsEnvironment.processStoredSettings(i);
    expect(r.instances.length).to.eq(2);
    expect(r.instances[0].url).to.eq('http://www.example.org/nagios');
    expect(r.instances[1].url).to.eq('http://www.icinga.org');
  });

  it('should restore sounds not set', () => {
    const i = {};
    const r = AbstractWebExtensionsEnvironment.processStoredSettings(i);
    expect(r.sounds).to.deep.eq({});
  });

  it('should restore sounds is null', () => {
    const i = { sounds: null };
    const r = AbstractWebExtensionsEnvironment.processStoredSettings(i);
    expect(r.sounds).to.deep.eq({});
  });

  it('should restore sounds', () => {
    const storedData = {
      sGREEN: {
        id: 'sGREEN',
        filename: 'green.wav',
        data: 'blob:gggg',
      },
      xRED: { id: 'xRED', filename: 'red.wav', data: 'blob:rrr' },
    };
    const i = {
      sounds: JSON.stringify(storedData),
    };
    const r = AbstractWebExtensionsEnvironment.processStoredSettings(i);
    expect(r.sounds).to.deep.eq(storedData);
  });

  describe('build sound id', () => {
    function testRun(status: Status, isNew: boolean, expected: string) {
      const soundid = AbstractWebExtensionsEnvironment.buildSoundId(
        status,
        isNew
      );
      expect(soundid).to.equal(expected);
    }

    it('green, new', () => {
      testRun(Status.GREEN, true, 'ToGREEN');
    });
    it('green', () => {
      testRun(Status.GREEN, false, 'GREEN');
    });
    it('yellow, new', () => {
      testRun(Status.YELLOW, true, 'ToYELLOW');
    });
    it('yellow', () => {
      testRun(Status.YELLOW, false, 'YELLOW');
    });
    it('red, new', () => {
      testRun(Status.RED, true, 'ToRED');
    });
    it('red', () => {
      testRun(Status.RED, false, 'RED');
    });
  });
});
