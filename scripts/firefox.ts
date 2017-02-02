import {AbstractWebExtensionsEnvironment} from "./AbstractWebExtensionsEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";

declare var browser: any

/**
 * Implementation for Firefox
 */
export class Firefox extends AbstractWebExtensionsEnvironment {
    displayStatus(data: Monitor.MonitorData): void {
        console.log(data)
    }

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
