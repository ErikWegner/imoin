import { IconAndBadgetext } from './IconAndBadgetext.js';
import { IEnvironment } from './IEnvironment.js';
import { IPanelMonitorData } from './IPanelMonitorData.js';
import { MonitorData, PanelMonitorData, Status } from './monitors/index.js';
import { Settings } from './Settings.js';
import { UICommand } from './UICommand.js';

export abstract class AbstractEnvironment implements IEnvironment {
  abstract onStartup(handler: () => void): void;

  public static mergeResultsFromAllInstances(buffers: {
    [index: number]: MonitorData;
  }): PanelMonitorData {
    const sources = Object.keys(buffers).map(
      (key) => buffers[parseInt(key, 10)],
    );

    if (sources.length === 0) {
      return AbstractEnvironment.createUpdatePendingResult();
    }

    const r = new PanelMonitorData();

    sources.forEach((source) => {
      r.addCountersAndMergeState(source);
      r.hosts = r.hosts.concat(source.hosts);
    });

    const allMessages =
      AbstractEnvironment.mergeMessagesFromAllInstances(sources);
    r.setMessage(allMessages.join('\n'));
    r.hosterrors += allMessages.length;

    return r;
  }

  protected static alarmName(index: number): string {
    return `imoin-${index}`;
  }

  protected static prepareIconAndBadgetext(
    data: MonitorData,
  ): IconAndBadgetext {
    let path = '';
    let badgeText = '';
    let badgeColor = '';
    switch (data.getFilteredState()) {
      case Status.GREEN:
        path = 'ok';
        /*badgeText = '' + data.hostup;*/
        badgeColor = '#83b225';
        break;
      case Status.YELLOW:
        path = 'warn';
        badgeText = `${data.filteredServicewarnings}`;
        badgeColor = '#b29a25';
        break;
      case Status.RED:
        path = 'err';
        badgeText = `${data.filteredHosterrors +
          data.filteredServicewarnings +
          data.filteredServiceerrors
          }`;
        badgeColor = '#b25425';
        break;
    }
    const iAndB = new IconAndBadgetext();
    iAndB.badgeText = badgeText;
    iAndB.badgeColor = badgeColor;
    iAndB.badgeIcon = {
      16: 'icons/icon-16' + path + '.png',
      20: 'icons/icon-32' + path + '.png',
      24: 'icons/icon-32' + path + '.png',
      32: 'icons/icon-32' + path + '.png',
      40: 'icons/icon-32' + path + '.png',
    };
    return iAndB;
  }

  private static sumFieldFromAllInstances(
    sources: MonitorData[],
    field:
      | 'hosterrors'
      | 'serviceerrors'
      | 'servicewarnings'
      | 'serviceok'
      | 'hostup',
  ): number {
    return sources
      .map((monitorData) => monitorData[field])
      .reduce((acc, val) => acc + val);
  }

  protected static createUpdatePendingResult(): PanelMonitorData {
    const r = new PanelMonitorData();
    r.setState(Status.RED);
    r.setMessage('Update pending');
    r.hosterrors = 0;
    r.servicewarnings = 0;
    r.serviceerrors = 0;
    return r;
  }

  private static mergeMessagesFromAllInstances(
    sources: MonitorData[],
  ): string[] {
    return sources
      .filter(
        (monitorData) =>
          typeof monitorData.message === 'string' && monitorData.message !== '',
      )
      .map(
        (monitorData) =>
          `(${monitorData.instanceLabel ?? '∞'}) ${monitorData.getMessage()}`,
      );
  }

  protected dataBuffer = AbstractEnvironment.createUpdatePendingResult();
  protected onSettingsChangedCallback?: () => void;

  private onUICommandCallbacks: {
    [index: number]: (param: UICommand) => void;
  } = {};
  private alarmCallbacks: { [alarmName: string]: () => void } = {};
  private dataBuffers: { [index: number]: MonitorData } = {};
  private panelMonitorData: { [index: number]: IPanelMonitorData } = {};
  private lastState?: Status;

  public abstract load(
    url: string,
    username: string,
    password: string,
  ): Promise<string>;
  public abstract post(
    url: string,
    data: unknown,
    username: string,
    password: string,
  ): Promise<string>;
  public abstract loadSettings(): Promise<Settings>;
  public abstract initTimer(
    index: number,
    delay: number,
    callback: () => void,
  ): void;
  public abstract stopTimer(index: number): void;
  public abstract registerAlarmHandler(): void;

  public registerMonitorInstance(index: number, monitor: IPanelMonitorData) {
    this.panelMonitorData[index] = monitor;
  }

  public onSettingsChanged(callback: () => void) {
    this.onSettingsChangedCallback = callback;
  }

  public onUICommand(
    index: number,
    callback: (param: UICommand) => void,
  ): void {
    this.onUICommandCallbacks[index] = callback;
  }

  public displayStatus(index: number, data: MonitorData): void {
    this.debug('displayStatus');
    this.dataBuffers[index] = data;
    this.panelMonitorData[index].updatetime = data.updatetime;
    this.dataBuffer = AbstractEnvironment.mergeResultsFromAllInstances(
      this.dataBuffers,
    );
    this.dataBuffer.instances = this.panelMonitorData;
    void this.saveData();
    this.handleNewData();
  }

  protected handleNewData() {
    this.debug('handleNewData');
    this.updateIconAndBadgetext();
    this.trySendDataToPopup();
    this.detectStateTransition(this.dataBuffer.getFilteredState());
  }

  public detectStateTransition(newState: Status) {
    this.audioNotification(newState, this.lastState !== newState);
    this.lastState = newState;
  }

  protected abstract debug(o: unknown): void;
  protected abstract log(o: unknown): void;
  protected abstract error(o: unknown): void;
  protected abstract saveData(): Promise<void>;
  protected abstract readData(): Promise<void>;

  /**
   * Play a notification sound
   * @param status The summarized state of all instances
   * @param isNew True, when this is a state change. False, when the
   *  last call to this function has had the equal value for status
   */
  protected abstract audioNotification(status: Status, isNew: boolean): void;
  protected abstract trySendDataToPopup(): void;
  protected abstract openWebPage(url: string): void;
  protected abstract updateIconAndBadgetext(): void;
  protected abstract openOptionsPage(): void;

  protected registerAlarmCallback(alarmName: string, callback: () => void) {
    this.alarmCallbacks[alarmName] = callback;
  }

  protected handleAlarm(alarm: { name: string }) {
    this.debug('Periodic alarm');
    if (!alarm) {
      return;
    }
    if (!this.alarmCallbacks[alarm.name]) {
      return;
    }
    this.alarmCallbacks[alarm.name]();
  }

  protected emitUICommand(index: number, param: UICommand) {
    const f = this.onUICommandCallbacks[index];
    if (f != null) {
      f(param);
    }
  }

  protected notifySettingsChanged() {
    if (this.onSettingsChangedCallback != null) {
      this.dataBuffer = AbstractEnvironment.createUpdatePendingResult();
      this.dataBuffers = {};
      this.panelMonitorData = {};
      this.alarmCallbacks = {};
      this.onSettingsChangedCallback();
    }
  }

  protected handleMessage(
    request?: UICommand,
    _sender?: unknown,
    _sendResponse?: (message: unknown) => void,
  ) {
    const command = request?.command || '';

    if (command === 'triggerRefresh') {
      const tf = (alarmName: string) => {
        this.handleAlarm({ name: alarmName });
      };

      if (request?.instanceindex !== undefined) {
        const alarmName = AbstractEnvironment.alarmName(request.instanceindex);
        tf(alarmName);
      } else {
        Object.keys(this.alarmCallbacks).forEach(tf);
      }
    }

    if (command === 'triggerOpenPage') {
      if (typeof request?.url === 'string' && request.url !== '') {
        this.openWebPage(request.url);
      }
    }

    if (
      command === 'triggerCmdExec' &&
      request?.remoteCommand &&
      request.instanceindex !== undefined
    ) {
      const c = <UICommand>{
        command: request.remoteCommand,
        hostname: request.hostname,
        servicename: request.servicename,
      };
      this.emitUICommand(request.instanceindex, c);
    }

    if (command === 'SettingsChanged') {
      this.notifySettingsChanged();
    }

    if (command === 'triggerShowOptions') {
      this.openOptionsPage();
    }
  }
}
