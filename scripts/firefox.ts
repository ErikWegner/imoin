import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment.js';
import browser from './definitions/firefox-webextension/index.js';
import { init } from './main.js';
import { Settings } from './Settings.js';

/**
 * Implementation for Firefox
 */
export class Firefox extends AbstractWebExtensionsEnvironment {
  protected host = browser;

  protected console = console;

  constructor() {
    super();
    browser.runtime.onConnect.addListener(this.connected.bind(this));
  }

  public async loadSettings(): Promise<Settings> {
    this.debug('Loading settings');

    try {
      const data = await browser.storage.local.get(
        AbstractWebExtensionsEnvironment.optionKeys
      );
      this.settings =
        AbstractWebExtensionsEnvironment.processStoredSettings(data);
      return this.settings;
    } catch (e: unknown) {
      this.error('Storage error');
      this.error(e);
      throw e;
    }
  }
}

init(new Firefox());
