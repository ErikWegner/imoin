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
        console.log("Chrome.displayStatus");
        console.log(data);
    }

    console() {
        return chrome.extension.getBackgroundPage().console;
    }
}

EnvironmentFactory.registerFactory(() => new Chrome());