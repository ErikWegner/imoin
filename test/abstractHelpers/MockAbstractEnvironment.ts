import { AbstractEnvironment } from '../../scripts/AbstractEnvironment';
import { Settings } from '../../scripts/Settings';
import * as sinon from 'sinon';
import { Monitor } from '../../scripts/monitors';

export class MockAbstractEnvironment extends AbstractEnvironment {
  public loadCallback: ((url: string, username: string, password: string) => Promise<string>) | null = null;
  public trySendDataToPopupSpy: sinon.SinonSpy;
  public audioNotificationSpy: sinon.SinonSpy;
  public initTimerSpy: sinon.SinonSpy;
  public displayStatusSpy: sinon.SinonSpy;
  public displayStatusNotify: (() => void) | null = null;

  constructor() {
    super();
    this.trySendDataToPopupSpy = sinon.spy();
    this.audioNotificationSpy = sinon.spy(this, 'audioNotification');
    this.initTimerSpy = sinon.spy(this, 'initTimer');
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

  public load(url: string, username: string, password: string): Promise<string> {
    if (this.loadCallback) {
      return this.loadCallback(url, username, password);
    } else {
      return Promise.reject('Method not implemented.');
    }
  }

  public post(url: string, data: any, username: string, password: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public debug(o: any): void {
    // no op
  }

  public log(o: any): void {
    throw new Error('Method not implemented.');
  }

  public error(o: any): void {
    // no op
  }

  public loadSettings(): Promise<Settings> {
    throw new Error('Method not implemented.');
  }

  public initTimer(index: number, delay: number, callback: () => void) {
    // no op
  }

  public stopTimer(index: number): void {
    throw new Error('Method not implemented.');
  }

  public audioNotification(status: Monitor.Status): void {
    // this function is spied on
  }

  public displayStatus(index: number, data: Monitor.MonitorData): void {
    super.displayStatus(index, data);
    if (typeof (this.displayStatusNotify) === 'function') {
      this.displayStatusNotify();
    }
  }

  protected trySendDataToPopup(): void {
    this.trySendDataToPopupSpy(this.dataBuffer);
  }

  protected openWebPage(url: string): void {
    throw new Error('Method not implemented.');
  }

  protected updateIconAndBadgetext(): void {
    // no op
  }

  protected openOptionsPage(): void {
    // no op
  }
}
