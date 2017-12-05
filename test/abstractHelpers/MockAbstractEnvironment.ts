import { AbstractEnvironment } from '../../scripts/AbstractEnvironment';
import { Settings } from '../../scripts/Settings';

export class MockAbstractEnvironment extends AbstractEnvironment {
  public registerAlarmCallbackPublic(alarmName: string, callback: () => void) {
    this.registerAlarmCallback(alarmName, callback);
  }

  public handleAlarmPublic(alarm: { name: string }) {
    this.handleAlarm(alarm);
  }

  load(url: string, username: string, password: string): Promise<string> {
    throw new Error("Method not implemented.");
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
    throw new Error("Method not implemented.");
  }
  loadSettings(): Promise<Settings> {
    throw new Error("Method not implemented.");
  }
  initTimer(index: number, delay: number, callback: () => void): void {
    throw new Error("Method not implemented.");
  }
  stopTimer(index: number): void {
    throw new Error("Method not implemented.");
  }
  protected trySendDataToPopup(): void {
    throw new Error("Method not implemented.");
  }
  protected openWebPage(url: string): void {
    throw new Error("Method not implemented.");
  }
  protected updateIconAndBadgetext(): void {
    throw new Error("Method not implemented.");
  }
} 
