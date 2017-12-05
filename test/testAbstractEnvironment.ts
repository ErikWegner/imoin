import 'mocha';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { MockAbstractEnvironment } from './abstractHelpers/MockAbstractEnvironment';

describe('AbstractEnvironnment', () => {
  it('should register and handle one alarm', () => {
    const mae = new MockAbstractEnvironment();
    const alarmName1 = 'm1';
    const spy = sinon.spy();
    mae.registerAlarmCallbackPublic(alarmName1, spy);
    expect(spy.called).to.equal(false);
    mae.handleAlarmPublic({ name: alarmName1 });
    expect(spy.called).to.equal(true);
  });

  it('should register and handle two alarms', () => {
    const mae = new MockAbstractEnvironment();
    const alarmNames = ['m1', 'xy'];
    const spies = [sinon.spy(), sinon.spy()];
    mae.registerAlarmCallbackPublic(alarmNames[0], spies[0]);
    mae.registerAlarmCallbackPublic(alarmNames[1], spies[1]);

    // until here, no callback has been executed
    expect(spies[0].called).to.equal(false);
    expect(spies[1].called).to.equal(false);

    // trigger first alarm
    mae.handleAlarmPublic({ name: alarmNames[0] });

    // first callback has been executed
    expect(spies[0].called).to.equal(true);
    // second callback has not been executed
    expect(spies[1].called).to.equal(false);

    // reset spies
    spies.forEach((spy) => spy.reset());

    // callbacks have not been executed after reset
    expect(spies[0].called).to.equal(false);
    expect(spies[1].called).to.equal(false);

    // trigger second alarm
    mae.handleAlarmPublic({ name: alarmNames[1] });

    // first callback has not been executed
    expect(spies[0].called).to.equal(false);
    // second callback has been executed
    expect(spies[1].called).to.equal(true);
  });
});
