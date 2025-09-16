import chrome from './definitions/chrome-webextension/index';
import { AlarmEvent } from './definitions/common-webextension/index';
import { V3Environment, V3Settings } from './IEnvironment';
import { Imoin } from './imoin';
import { remoteLog, RemoteLog } from './remotelogger';
import { ImoinMonitorInstance, Sound } from './Settings';

const optionKeys = ['instances', 'fontsize', 'sounds', 'inlineresults'];

class ChromeEnvironment implements V3Environment {
  protected host = chrome;
  private alarmHandler: ((alarm: AlarmEvent) => void) | null = null;

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
      remoteLog('error', 'No alarm handler registered for alarm');
    }
  }

  public openSettingspage() {
    chrome.runtime.openOptionsPage();
  }
}

// RemoteLog from popup message handler

remoteLog('debug', 'Initializing Chrome environment...');
const logging = new RemoteLog();
const chromeEnvironment = new ChromeEnvironment();
const imoin = new Imoin(logging, chromeEnvironment);

chrome.runtime.onInstalled.addListener((details) => {
  remoteLog('debug', 'Extension installed2.');
  imoin.installedEvent(details);
});

async function restartCheck() {
  const hasAlarms = (await chrome.alarms.getAll()).length > 0;
  await imoin.activatedEvent(hasAlarms);
}

void restartCheck();
