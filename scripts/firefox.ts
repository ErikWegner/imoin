import {AbstractWebExtensionsEnvironment} from "./AbstractWebExtensionsEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";

declare var browser: any

/**
 * Implementation for Firefox
 */
export class Firefox extends AbstractWebExtensionsEnvironment {
    constructor() {
        super();
        browser.runtime.onMessage.addListener(this.handleMessage);
    }

    handleMessage(request: any, sender: any, sendResponse: (message: any) => void) {
        if (request.message == "SettingsChanged") {
            this.notifySettingsChanged();
        }
    }

    displayStatus(data: Monitor.MonitorData): void {
        console.log(data)
    }

    loadSettings() : Promise<Settings> {
        console.log("Loading settings");
        return new Promise<Settings>(
            (resolve, reject) => {
                /* Change the array of keys to match the options.js */
                var gettingItem = browser.storage.local.get(["timerPeriod", "icingaversion", "url", "username", "password"]);
                gettingItem.then(function (settings: Settings) {
                        console.log("Settings loaded");
                        var clone = JSON.parse(JSON.stringify(settings))
                        if (clone.password) clone.password = "*****"
                        console.log(clone);
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

    stopTimer() {
        this.removeAlarm(browser);
    }

    load(url: string, username: string, password: string): Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.setRequestHeader("Authorization", "Basic " + btoa(username+":"+password))
                xhr.withCredentials = true;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(xhr.responseText);
                        }
                    }
                }
                xhr.send();                
            }
        );
    }

}
