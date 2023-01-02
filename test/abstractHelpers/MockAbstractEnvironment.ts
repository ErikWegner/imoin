import * as sinon from 'sinon';

import { AbstractEnvironment } from '../../scripts/AbstractEnvironment';
import { Settings } from '../../scripts/Settings';
import { MonitorData, Status } from '../monitors';

export class MockAbstractEnvironment extends AbstractEnvironment {
  public loadCallback:
    | ((url: string, username: string, password: string) => Promise<string>)
    | null = null;
  public trySendDataToPopupSpy: sinon.SinonSpy;
  public audioNotificationSpy: sinon.SinonSpy;
  public initTimerSpy: sinon.SinonSpy<[number, number, () => void]>;
  public displayStatusSpy: sinon.SinonSpy;
  public displayStatusNotify: (() => void) | null = null;

  constructor() {
    super();
    this.trySendDataToPopupSpy = sinon.spy();
    this.audioNotificationSpy = sinon.spy(this, 'audioNotification');
    this.initTimerSpy = sinon.spy<MockAbstractEnvironment, 'initTimer'>(
      this,
      'initTimer'
    );
    this.displayStatusSpy = sinon.spy(this, 'displayStatus');
  }

  public registerAlarmCallbackPublic(alarmName: string, callback: () => void) {
    this.registerAlarmCallback(alarmName, callback);
  }

  public handleAlarmPublic(alarm: { name: string }) {
    this.handleAlarm(alarm);
  }

  public getDataBuffer() {
    return this.dataBuffer;
  }

  public load(
    url: string,
    username: string,
    password: string
  ): Promise<string> {
    if (this.loadCallback) {
      return this.loadCallback(url, username, password);
    } else {
      return Promise.reject('Method not implemented.');
    }
  }

  public post(
    _url: string,
    _data: never,
    _username: string,
    _password: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public debug(_o: never): void {
    // no op
  }

  public log(_o: never): void {
    throw new Error('Method not implemented.');
  }

  public error(_o: never): void {
    // no op
  }

  public loadSettings(): Promise<Settings> {
    throw new Error('Method not implemented.');
  }

  public initTimer(_index: number, _delay: number, _callback: () => void) {
    // no op
  }

  public stopTimer(_index: number): void {
    throw new Error('Method not implemented.');
  }

  public audioNotification(_status: Status): void {
    // this function is spied on
  }

  public displayStatus(index: number, data: MonitorData): void {
    super.displayStatus(index, data);
    if (typeof this.displayStatusNotify === 'function') {
      this.displayStatusNotify();
    }
  }

  protected trySendDataToPopup(): void {
    this.trySendDataToPopupSpy(this.dataBuffer);
  }

  protected openWebPage(_url: string): void {
    throw new Error('Method not implemented.');
  }

  protected updateIconAndBadgetext(): void {
    // no op
  }

  protected openOptionsPage(): void {
    // no op
  }
}
