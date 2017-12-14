/// <reference path='definitions/chrome-webextension/index.d.ts' />

import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment';
import { Settings } from './Settings';
import { Monitor } from './MonitorData';
import Status = Monitor.Status;
import { init } from './main';

/**
 * Implementation for Chrome
 */
export class Chrome extends AbstractWebExtensionsEnvironment {

    protected host = chrome

    protected console = chrome.extension.getBackgroundPage().console;

    constructor() {
        super();
        chrome.runtime.onConnect.addListener(this.connected.bind(this));
    }

    loadSettings(): Promise<Settings> {
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
        )
    }

    debug(o: any) {
        // no-op
    }

    log(o: any) {
        // no-op
    }
}

init(new Chrome());
