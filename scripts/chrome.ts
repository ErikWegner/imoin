/// <reference path="definitions/chrome-webextension/index.d.ts" />

import {AbstractWebExtensionsEnvironment} from "./AbstractWebExtensionsEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";
import Status = Monitor.Status;
import {EnvironmentFactory} from "./IEnvironment";

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
                    ["timerPeriod", "icingaversion", "url", "username", "password", "hostgroup"],
                    items => {
                        let settings = new Settings(
                            items["timerPeriod"],
                            items["icingaversion"],
                            items["url"],
                            items["username"],
                            items["password"],
                            items["hostgroup"]
                        );
                        resolve(settings);
                    })
            }
        )
    }

    initTimer(delay: number, callback: () => void): void {
        this.addAlarm(chrome, delay, callback);
    }

    stopTimer(): void {
        this.removeAlarm(chrome);
    }

    displayStatus(data: Monitor.MonitorData): void {
        this.debug("Chrome.displayStatus");
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

EnvironmentFactory.registerFactory(() => new Chrome());