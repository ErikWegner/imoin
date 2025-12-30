import chrome from './definitions/chrome-webextension/index';
import { AlarmEvent, Port } from './definitions/common-webextension/index';
import { IconAndBadgetext } from './IconAndBadgetext';
import {
  AlarmSetupInformation,
  V3Environment,
  V3Loader,
  V3Settings,
} from './IEnvironment';
import { Imoin } from './imoin';
import { MonitorDataV3 } from './monitors';
import { remoteLog, RemoteLog } from './remotelogger';
import { ImoinMonitorInstance, Settings, Sound } from './Settings';
import { UICommand } from './UICommand';

const optionKeys = ['instances', 'fontsize', 'sounds', 'inlineresults'];

let imoinSingleton: Imoin | null = null;
function runWithImoin(callback: (i: Imoin) => void) {
  if (!imoinSingleton) {
    const logging = new RemoteLog();
    const chromeEnvironment = new ChromeEnvironment();
    const imoin = new Imoin(logging, chromeEnvironment);
    imoinSingleton = imoin;
  }
  try {
    callback(imoinSingleton);
  } catch (error) {
    remoteLog('error', 'Error in runWithImoin:', error);
  }
}

class ChromeHostEventSource {
  private host = chrome;
  private logger = new RemoteLog();

  constructor() {
    this.logger.debug('ChromeHostEventSource constructor');
    this.host.runtime.onConnect.addListener((port) => {
      remoteLog('debug', 'Received connection:', port);
      port.onMessage.addListener((message) => {
        remoteLog('debug', 'Received message:', message);
        switch (message.command) {
          case 'OpenConfiguration':
            runWithImoin((imoin) => imoin.openSettingspage());
            break;
          case 'SettingsChanged':
            runWithImoin((imoin) => {
              void imoin.notifySettingsChanged();
            });
            break;
          case 'TriggerRefresh':
            runWithImoin((imoin) => {
              void imoin.triggerRefresh();
            });
        }
      });
    });
  }
}

class ChromeEnvironment implements V3Environment, V3Loader {
  protected host = chrome;
  private alarmHandler: ((alarm: AlarmEvent) => void) | null = null;
  private panelPort: Port | null = null;
  private pendingAlarms: Map<string, AlarmEvent> = new Map();
  private logger = new RemoteLog();

  public async load(
    url: string,
    username: string,
    password: string,
  ): Promise<string> {
    const headers = new Headers();
    if (username) {
      headers.append(
        'Authorization',
        'Basic ' + btoa(username + ':' + password),
      );
    }
    const res = await fetch(url, {
      headers,
      method: 'GET',
    });
    if (res.status === 200) {
      return res.text();
    }
    throw new Error(`Network failure: ${res.status} ${res.statusText}`);
  }

  public async ensureAlarms(
    alarms: AlarmSetupInformation[],
    options: { clearExistingAlarms: boolean },
  ): Promise<void> {
    this.logger.debug('Ensuring alarms:', alarms);
    if (options.clearExistingAlarms) {
      this.logger.debug('Clearing existing alarms');
      await this.host.alarms.clearAll();
    }
    const existingAlarms = await this.host.alarms.getAll();
    const existingAlarmsNames = existingAlarms.map((alarm) => alarm.name);
    for (const alarm of alarms) {
      if (!existingAlarmsNames.includes(alarm.alarmName)) {
        this.logger.debug('Adding alarm ' + alarm.alarmName);
        await this.createAlarm(alarm.alarmName, alarm.timerPeriod);
      } else {
        this.logger.debug('Alarm already exists ' + alarm.alarmName);
      }
    }
  }

  public sendPanelMessage(msg: UICommand): void {
    if (this.panelPort) {
      this.panelPort.postMessage(msg);
    } else {
      remoteLog('debug', 'Panel port not found, dropping message:', msg);
    }
  }

  async getSettings(): Promise<V3Settings> {
    const data = (await this.host.storage.sync.get(optionKeys)) as {
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

    // Remove trailing slash for all instances
    settings.instances.forEach((i) => (i.url = Settings.urlNoTrailingSlash(i)));

    return settings;
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

  setOverallStatus(overallStatus: IconAndBadgetext): void {
    this.host.action.setBadgeBackgroundColor({
      color: overallStatus.badgeColor,
    });
    this.host.action.setBadgeText({ text: overallStatus.badgeText });
    this.host.action.setIcon({ path: overallStatus.badgeIcon });
    this.host.action.setTitle({ title: overallStatus.badgeTooltip });
  }
}

// RemoteLog from popup message handler
remoteLog('debug', 'Initializing Chrome environment...');

function checkAndRestoreAlarms() {
  remoteLog('debug', 'Checking and restoring alarms...');
  runWithImoin((imoin) => {
    imoin.setupAlarms();
    void imoin.triggerRefresh();
  });
}

let eventSourceSingleton: ChromeHostEventSource | null = null;
if (!eventSourceSingleton) {
  eventSourceSingleton = new ChromeHostEventSource();
  checkAndRestoreAlarms();
}

chrome.runtime.onStartup.addListener(() => {
  remoteLog('debug', 'Extension started.');
  checkAndRestoreAlarms();
});

chrome.runtime.onInstalled.addListener((details) => {
  remoteLog('debug', 'Extension installed.');
  runWithImoin((imoin) => imoin.installedEvent(details));
});

chrome.alarms.onAlarm.addListener((alarm) => {
  remoteLog('debug', 'Alarm received:', alarm.name);
  runWithImoin((imoin) => {
    void imoin.alarmEvent(alarm);
  });
});
