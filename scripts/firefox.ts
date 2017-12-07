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
                let gettingItem = browser.storage.local.get(['timerPeriod', 'icingaversion', 'url', 'username', 'password']);
                if (gettingItem) {
                    gettingItem.then(function (settings: Settings) {
                        i.debug('Settings loaded');
                        let clone = JSON.parse(JSON.stringify(settings));
                        if (clone.password) clone.password = '*****';
                        i.debug(clone);
                        // success
                        resolve(settings);
                    }, function (error: any) {
                        i.error('Loading settings failed');
                        i.error(error);
                        reject(error)
                    }
                    )
                } else {
                    i.error('Storage not available');
                }
            }
        );

    }
}

init(new Firefox());
