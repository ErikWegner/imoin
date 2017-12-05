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
        return new Promise<Settings>(
            (resolve, reject) => {
                chrome.storage.local.get(
                    ['instances'],
                    (data) => {
                        const settings = new Settings();
                        if (data.instances) {
                            settings.instances = JSON.parse(data.instances);
                        }
                        resolve(settings);
                    })
            }
        )
    }

    displayStatus(data: Monitor.MonitorData): void {
        this.debug('Chrome.displayStatus');
        this.dataBuffer = data;
        this.updateIconAndBadgetext();
        this.trySendDataToPopup();
    }

    debug(o: any) {
        // no-op
    }

    log(o: any) {
        // no-op
    }
}

init(new Chrome());
