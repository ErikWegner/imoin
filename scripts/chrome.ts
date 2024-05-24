import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment.js';
import chrome from './definitions/chrome-webextension/index.js';
import { init } from './main.js';
import { Settings } from './Settings.js';

/**
 * Implementation for Chrome
 */
export class Chrome extends AbstractWebExtensionsEnvironment {
  protected host = chrome;

  protected console = console;

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

  protected debug(_o: unknown) {
    super.debug(_o);
    // no-op
  }

  protected log(_o: unknown) {
    super.log(_o);
    // no-op
  }
}

init(new Chrome());
