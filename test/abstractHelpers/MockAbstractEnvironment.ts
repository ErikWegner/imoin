import { AbstractEnvironment } from '../../scripts/AbstractEnvironment';
import { Settings } from '../../scripts/Settings';
import * as sinon from 'sinon';
import { Monitor } from '../../scripts/MonitorData';

export class MockAbstractEnvironment extends AbstractEnvironment {
  public loadCallback: (url: string, username: string, password: string) => Promise<string> = null;
  public trySendDataToPopupSpy: sinon.SinonSpy;
  public audioNotificationSpy: sinon.SinonSpy;
  public initTimerSpy: sinon.SinonSpy;
  public displayStatusSpy: sinon.SinonSpy;
  public displayStatusNotify: () => void;
  
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

  load(url: string, username: string, password: string): Promise<string> {
    if (this.loadCallback) {
      return this.loadCallback(url, username, password);
    } else {
      return Promise.reject("Method not implemented.");
    }
  }

  post(url: string, data: any, username: string, password: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  debug(o: any): void {
    //no op
  }
  log(o: any): void {
    throw new Error("Method not implemented.");
  }
  error(o: any): void {
    //no op
  }
  loadSettings(): Promise<Settings> {
    throw new Error("Method not implemented.");
  }
  initTimer(index: number, delay: number, callback: () => void): void { }
  stopTimer(index: number): void {
    throw new Error("Method not implemented.");
  }
  protected trySendDataToPopup(): void {
    this.trySendDataToPopupSpy(this.dataBuffer);
  }
  protected openWebPage(url: string): void {
    throw new Error("Method not implemented.");
  }
  protected updateIconAndBadgetext(): void {
    // no op
  }
  audioNotification(status: Monitor.Status): void {
    // this function is spied on
  }

  public displayStatus(index: number, data: Monitor.MonitorData): void {
    super.displayStatus(index, data);
    if (typeof(this.displayStatusNotify) == 'function') {
      this.displayStatusNotify();
    }
  }
} 
