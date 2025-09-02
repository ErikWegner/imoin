import chrome from './definitions/chrome-webextension/index';
import { AlarmEvent } from './definitions/common-webextension/index';
import { V3Environment } from './IEnvironment';
import { Imoin } from './imoin';
import { remoteLog, RemoteLog } from './remotelogger';

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
