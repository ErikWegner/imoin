import chrome from './definitions/chrome-webextension/index';
import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment';
import { Settings } from './Settings';
import { Monitor } from './monitors';
import Status = Monitor.Status;
import { init } from './main';

/**
 * Implementation for Chrome
 */
export class Chrome extends AbstractWebExtensionsEnvironment {

    protected host = chrome;

    protected console = chrome.extension.getBackgroundPage().console;

    constructor() {
        super();
        chrome.runtime.onConnect.addListener(this.connected.bind(this));
    }

    public loadSettings(): Promise<Settings> {
        const i = this;
        return new Promise<Settings>(
            (resolve, reject) => {
                chrome.storage.local.get(
                    AbstractWebExtensionsEnvironment.optionKeys,
                    (data) => {
                        i.settings = AbstractWebExtensionsEnvironment.processStoredSettings(data);
                        resolve(i.settings);
                    });
            }
        );
    }

    protected debug(o: any) {
        // no-op
    }

    protected log(o: any) {
        // no-op
    }
}

init(new Chrome());
