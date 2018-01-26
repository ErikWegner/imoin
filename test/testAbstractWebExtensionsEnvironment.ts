import 'mocha';
import { assert, expect } from 'chai';

import { AbstractWebExtensionsEnvironment } from '../scripts/AbstractWebExtensionsEnvironment';

describe('AbstractWebExtensionsEnvironment', () => {
  it('should remove slashes', () => {
    const i1 = '{"url":"http://www.example.org/nagios/"}';
    const i2 = '{"url":"http://www.icinga.org/"}';
    const i  = { instances: '[' + i1 + ',' + i2 + ']' };
    const r = AbstractWebExtensionsEnvironment.processStoredSettings(i);
    expect(r.instances.length).to.eq(2);
    expect(r.instances[0].url).to.eq('http://www.example.org/nagios');
    expect(r.instances[1].url).to.eq('http://www.icinga.org');
  });
});

