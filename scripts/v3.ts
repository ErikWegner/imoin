import chrome from './definitions/chrome-webextension/index';
import { AlarmEvent } from './definitions/common-webextension/index';
import { V3Environment } from './IEnvironment';
import { Imoin } from './imoin';
import { RemoteLog } from './remotelogger';

const remoteLog = (level: string, ...args: unknown[]) => {
  void fetch('http://localhost:3000/log', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      message: args.join(' '),
      level,
    }),
  });
};

class ChromeEnvironment implements V3Environment {
  protected host = chrome;

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

  createAlarm(alarmName: string, periodInMinutes: number): Promise<void> {
    return this.host.alarms.create(alarmName, {
      periodInMinutes,
    });
  }

  handleAlarm(_alarm: AlarmEvent) {
    throw new Error('Method not implemented.');
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
  imoin.activatedEvent(hasAlarms);
}

void restartCheck();
