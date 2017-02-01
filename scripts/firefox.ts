import {AbstractWebExtensionsEnvironment} from "./AbstractWebExtensionsEnvironment";
import {Settings} from "./Settings";

declare var browser: any

/**
 * Implementation for Firefox
 */
export class Firefox extends AbstractWebExtensionsEnvironment {
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
