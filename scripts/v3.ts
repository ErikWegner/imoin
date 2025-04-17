import chrome from './definitions/chrome-webextension';
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

const imoin = new Imoin(new RemoteLog());

chrome.runtime.onInstalled.addListener(() => {
  imoin.installedEvent();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  imoin.alarmEvent(alarm);
});
