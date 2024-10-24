import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment.js';
import chrome from './definitions/chrome-webextension/index.js';
import { init } from './main.js';
import { Settings } from './Settings.js';

/**
 * Implementation for Chrome
 */
export class Chrome extends AbstractWebExtensionsEnvironment {
  protected host = chrome;

  private remoteLog = (level: string, ...args: unknown[]) => {
    void this.post(
      'http://localhost:3000/log',
      {
        message: args.join(' '),
        level,
      },
      '',
      '',
    );
  };

  protected console = {
    log: (...args: unknown[]) => {
      console.log(...args);
      this.remoteLog('info', ...args);
    },
    error: (...args: unknown[]) => {
      console.error(...args);
      this.remoteLog('error', ...args);
    },
    debug: (...args: unknown[]) => {
      console.debug(...args);
      this.remoteLog('debug', ...args);
    },
  };

  constructor() {
    super();
    chrome.runtime.onConnect.addListener(this.connected.bind(this));
  }

  public loadSettings(): Promise<Settings> {
    return new Promise<Settings>((resolve) => {
      chrome.storage.local.get(
        AbstractWebExtensionsEnvironment.optionKeys,
        (data) => {
          this.settings =
            AbstractWebExtensionsEnvironment.processStoredSettings(data);
          resolve(this.settings);
        },
      );
    });
  }
}

init(new Chrome());
