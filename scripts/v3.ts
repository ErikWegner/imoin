import chrome from './definitions/chrome-webextension/index';
import { AlarmEvent } from './definitions/common-webextension/index';

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

abstract class V3Environment {
  protected abstract openSettingspage(): void;
}

class ChromeEnvironment extends V3Environment {
  protected host = chrome;

  constructor() {
    super();
    this.host.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
  }

  handleAlarm(_alarm: AlarmEvent) {
    throw new Error('Method not implemented.');
  }

  public openSettingspage() {
    chrome.runtime.openOptionsPage();
  }
}

remoteLog('debug', 'Initializing Chrome environment...');
const chromeEnvironment = new ChromeEnvironment();

chrome.runtime.onInstalled.addListener(() => {
  remoteLog('debug', 'Extension installed2.');
  chromeEnvironment.openSettingspage();
});
