import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment';
import chrome from './definitions/chrome-webextension/index';
import { init } from './main';
import { Settings } from './Settings';

/**
 * Implementation for Opera
 */
export class Opera extends AbstractWebExtensionsEnvironment {
  protected host = chrome;

  protected console = chrome.runtime.getBackgroundPage().console;

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
        }
      );
    });
  }

  protected debug(_o: unknown) {
    // no-op
  }

  protected log(_o: unknown) {
    // no-op
  }
}

init(new Opera());
