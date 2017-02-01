/// <reference path="definitions/es6-promise/index.d.ts" />

import {IEnvironment, Settings} from "./IEnvironment";

var browser: any

/*class Settings {
    constructor(public timerPeriod = 5) {
    }
}

interface IEnvironment {
    initTimer(delay: number, callback: () => void): void
    loadSettings(): Promise<Settings>
}*/

/**
 * A common implementation
 */

abstract class AbstractWebExtensionsEnvironment implements IEnvironment {
    abstract loadSettings(): Promise<Settings>

    abstract initTimer(delay: number, callback: () => void): void

    addAlarm(webExtension: any, delay: number, callback: () => void): void {
        webExtension.alarms.create(
            "imoin",
            {
                periodInMinutes: delay
            }
        )
        webExtension.alarms.onAlarm.addListener((alarm: any) => {
            callback();
        })

    }
}

/**
 * Implementation for Firefox
 */

class Firefox extends AbstractWebExtensionsEnvironment {
    loadSettings() : Promise<Settings> {
        return new Promise<Settings>(
            (resolve, reject) => {
                var gettingItem = browser.storage.local.get("imoinsettings");
                gettingItem.then(function (settings: Settings) {
                        // success
                        resolve(settings);
                    }, function (error: any) {
                        console.error("Loading settings failed");
                        console.error(error);
                        reject(error)
                    }
                )
            }
        );

    }

    initTimer(delay: number, callback: () => void): void {
        this.addAlarm(browser, delay, callback);
    }

}

/**
 * Connecting all pieces together
 */

var e: IEnvironment = new Firefox()

e.loadSettings().then((settings) => {
    e.initTimer(settings.timerPeriod, function () {
        console.log("Alarm2");
    })
})

