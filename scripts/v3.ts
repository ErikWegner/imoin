import chrome from './definitions/chrome-webextension/index';
import { AlarmEvent, Port } from './definitions/common-webextension/index';
import { V3Environment, V3Settings } from './IEnvironment';
import { Imoin } from './imoin';
import { MonitorDataV3 } from './monitors';
import { remoteLog, RemoteLog } from './remotelogger';
import { ImoinMonitorInstance, Sound } from './Settings';
import { UICommand } from './UICommand';

const optionKeys = ['instances', 'fontsize', 'sounds', 'inlineresults'];

class ChromeEnvironment implements V3Environment {
  protected host = chrome;
  private alarmHandler: ((alarm: AlarmEvent) => void) | null = null;
  private panelPort: Port | null = null;
  private pendingAlarms: Map<string, AlarmEvent> = new Map();

  constructor() {
    this.host.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
    this.host.runtime.onConnect.addListener((port) => {
      remoteLog('debug', 'Received connection:', port);
      port.onMessage.addListener((message) => {
        remoteLog('debug', 'Received message:', message);
        if (message.command === 'open_configuration') {
          this.openSettingspage();
        }
      });
    });
  }

  sendPanelMessage(msg: UICommand): void {
    if (this.panelPort) {
      this.panelPort.postMessage(msg);
    } else {
      remoteLog('debug', 'Panel port not found, dropping message:', msg);
    }
  }

  async getSettings(): Promise<V3Settings> {
    const data = (await this.host.storage.local.get(optionKeys)) as {
      instances?: unknown;
      fontsize?: unknown;
      inlineresults?: unknown;
      sounds?: unknown;
    };
    const settings: V3Settings = {
      instances: [],
      fontsize: 100,
      inlineresults: false,
      sounds: {},
    };
    if (data) {
      if (typeof data.instances === 'string') {
        settings.instances = JSON.parse(
          data.instances,
        ) as ImoinMonitorInstance[];
      }
      if (typeof data.fontsize === 'number' && data.fontsize > 0) {
        settings.fontsize = data.fontsize;
      }
      settings.inlineresults = data.inlineresults === 1;
      if (typeof data.sounds === 'string') {
        settings.sounds = JSON.parse(data.sounds) as { [id: string]: Sound };
      }
    }

    return settings;
  }

  registerAlarmHandler(handler: (alarm: AlarmEvent) => void): void {
    remoteLog('debug', 'Registering alarm handler');
    this.alarmHandler = handler;

    // Trigger pending alarms
    const pendingAlarms = Array.from(this.pendingAlarms.entries());
    this.pendingAlarms.clear();
    while (pendingAlarms.length > 0) {
      const [alarmName, alarmEvent] = pendingAlarms.shift()!;
      remoteLog('debug', 'Handling pending alarm:', alarmName);
      this.handleAlarm(alarmEvent);
    }
  }

  createAlarm(alarmName: string, periodInMinutes: number): Promise<void> {
    return this.host.alarms.create(alarmName, {
      periodInMinutes,
    });
  }

  handleAlarm(alarm: AlarmEvent) {
    if (this.alarmHandler) {
      this.alarmHandler(alarm);
    } else {
      remoteLog('info', 'Postponed alarm:', alarm.name);
      this.pendingAlarms.set(alarm.name, alarm);
    }
  }

  public openSettingspage() {
    chrome.runtime.openOptionsPage();
  }

  public saveInstancesData(instancesData: MonitorDataV3[]): Promise<void> {
    return this.host.storage.local.set({
      instancesData,
    });
  }

  public async getInstancesData(): Promise<MonitorDataV3[]> {
    const defaultValue: MonitorDataV3[] = [];
    const data = await this.host.storage.local.get({
      instancesData: defaultValue,
    });
    return data.instancesData;
  }
}

// RemoteLog from popup message handler
remoteLog('debug', 'Initializing Chrome environment...');
const logging = new RemoteLog();

// Keep the following code as small as possible
const chromeEnvironment = new ChromeEnvironment();
const imoin = new Imoin(logging, chromeEnvironment);

chrome.runtime.onInstalled.addListener((details) => {
  remoteLog('debug', 'Extension installed.');
  imoin.installedEvent(details);
});

async function restartCheck() {
  const hasAlarms = (await chrome.alarms.getAll()).length > 0;
  await imoin.activatedEvent(hasAlarms);
}

void restartCheck();
