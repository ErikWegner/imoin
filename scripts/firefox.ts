/// <reference path='definitions/firefox-webextension/index.d.ts' />

import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment';
import { Settings } from './Settings';
import { Monitor } from './MonitorData';
import { init } from './main';

/**
 * Implementation for Firefox
 */
export class Firefox extends AbstractWebExtensionsEnvironment {
    protected host = browser;

    protected console = console;

    constructor() {
        super();
        browser.runtime.onConnect.addListener(this.connected.bind(this));
        // temporary update notification
        browser.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'update') {
                this.openWebPage('https://github.com/ErikWegner/imoin/releases/tag/17.1.0');
            }
        });
    }

    loadSettings(): Promise<Settings> {
        const i = this;
        i.debug('Loading settings');
        return new Promise<Settings>(
            (resolve, reject) => {
                /* Change the array of keys to match the options.js */
                const storagePromise = browser.storage.local.get(AbstractWebExtensionsEnvironment.optionKeys);
                if (storagePromise) {
                    storagePromise.then(function (data: any) {
                        i.settings = AbstractWebExtensionsEnvironment.processStoredSettings(data);
                        resolve(i.settings);
                    }, function (error: any) {
                        i.error('Loading settings failed');
                        i.error(error);
                        reject(error);
                    }
                    );
                } else {
                    i.error('Storage not available');
                }
            }
        );

    }
}

init(new Firefox());
