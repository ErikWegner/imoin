import chrome from './definitions/chrome-webextension';
import { V3Environment } from './IEnvironment';
import { Imoin } from './imoin';
import { Logger } from './logger';

class RemoteLog implements Logger {
  private remoteLog = (level: string, ...args: unknown[]) => {
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    void fetch('http://localhost:3000/log', {
      headers,
      method: 'POST',
      body: JSON.stringify({
        message: args.join(' '),
        level,
      }),
    });
  };

  log(...args: unknown[]): void {
    this.remoteLog('info', ...args);
  }
  error(...args: unknown[]): void {
    this.remoteLog('error', ...args);
  }
  debug(...args: unknown[]): void {
    this.remoteLog('debug', ...args);
  }
}

class V3Host implements V3Environment {
  constructor(/** The logger */ private l: Logger) { }

  createAlarm(alarmName: string, periodMinutes: number): Promise<void> {
    this.l.debug('Create alarm', alarmName, periodMinutes);
    return chrome.alarms.create(alarmName, {
      periodInMinutes: periodMinutes,
    });
  }
}

const logging = new RemoteLog();
const hostEnvironment = new V3Host(logging);
const imoin = new Imoin(logging, hostEnvironment);

chrome.runtime.onInstalled.addListener((details) => {
  imoin.installedEvent(details);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  imoin.alarmEvent(alarm);
});

async function restartCheck() {
  const hasAlarms = (await chrome.alarms.getAll()).length > 0;
  imoin.activatedEvent(hasAlarms);
}

void restartCheck();
