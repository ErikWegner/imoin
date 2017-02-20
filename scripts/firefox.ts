/// <reference path="definitions/firefox-webextension/index.d.ts" />

import {AbstractWebExtensionsEnvironment} from "./AbstractWebExtensionsEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";
import {UICommand} from "./UICommand";
import {EnvironmentFactory} from "./IEnvironment";

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

    loadSettings(): Promise<Settings> {
        this.debug("Loading settings");
        return new Promise<Settings>(
            (resolve, reject) => {
                /* Change the array of keys to match the options.js */
                let gettingItem = browser.storage.local.get(["timerPeriod", "icingaversion", "url", "username", "password"]);
                if (gettingItem) {
                    gettingItem.then(function (settings: Settings) {
                            this.debug("Settings loaded");
                            let clone = JSON.parse(JSON.stringify(settings));
                            if (clone.password) clone.password = "*****";
                            this.debug(clone);
                            // success
                            resolve(settings);
                        }, function (error: any) {
                            console.error("Loading settings failed");
                            console.error(error);
                            reject(error)
                        }
                    )
                } else {
                    console.error("Storage not available");
                }
            }
        );

    }

    initTimer(delay: number, callback: () => void): void {
        this.addAlarm(browser, delay, callback);
    }

    stopTimer() {
        this.removeAlarm(browser);
    }
}

EnvironmentFactory.registerFactory(() => new Firefox());