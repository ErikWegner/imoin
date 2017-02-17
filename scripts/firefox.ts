/// <reference path="definitions/firefox-webextension/index.d.ts" />

import {AbstractWebExtensionsEnvironment} from "./AbstractWebExtensionsEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";
import Status = Monitor.Status;
import {UICommand} from "./UICommand";

/**
 * Implementation for Firefox
 */
export class Firefox extends AbstractWebExtensionsEnvironment {
    private portFromPanel: Browser.Port;
    private dataBuffer: Monitor.MonitorData;

    constructor() {
        super();
        browser.runtime.onConnect.addListener(this.connected.bind(this));

    }

    connected(p: Browser.Port) {
        console.log("Firefox.connected (panel opened)");
        const me = this;
        this.portFromPanel = p;
        this.portFromPanel.onMessage.addListener(this.handleMessage.bind(this));
        this.portFromPanel.onDisconnect.addListener(function () {
            console.log("Firefox.disconnected (panel closed)");
            me.portFromPanel = null;
        });
        this.trySendDataToPopup();
    }

    handleMessage(request: any, sender: any, sendResponse: (message: any) => void) {
        const command = request.command || "";

        if (command == "triggerRefresh") {
            this.handleAlarm();
        }

        if (command == "triggerOpenPage") {
            if (typeof (command.url) !== "undefined" && command.url != "") {
                browser.tabs.create({
                    url: request.url
                });
            }
        }

        if (command == "triggerCmdExec") {
            let c = new UICommand;
            c.command = request.remoteCommand;
            c.hostname = request.hostname;
            c.servicename = request.servicename;
        }

        if (command == "SettingsChanged") {
            this.notifySettingsChanged();
        }
    }

    displayStatus(data: Monitor.MonitorData): void {
        console.log("Firefox.displayStatus");
        this.dataBuffer = data;
        this.updateIconAndBadgetext();
        this.trySendDataToPopup();
    }

    loadSettings(): Promise<Settings> {
        console.log("Loading settings");
        return new Promise<Settings>(
            (resolve, reject) => {
                /* Change the array of keys to match the options.js */
                let gettingItem = browser.storage.local.get(["timerPeriod", "icingaversion", "url", "username", "password"]);
                gettingItem.then(function (settings: Settings) {
                        console.log("Settings loaded");
                        let clone = JSON.parse(JSON.stringify(settings));
                        if (clone.password) clone.password = "*****";
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
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                if (username) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                    xhr.withCredentials = true;
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(xhr.responseText);
                        }
                    }
                };
                xhr.send();
            }
        );
    }

    post(url: string, data: any, username: string, password: string): Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                if (username) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                    xhr.withCredentials = true;
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(xhr.responseText);
                        }
                    }
                };
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(data));
            }
        )
    }


    protected trySendDataToPopup() {
        if (this.portFromPanel) {
            this.portFromPanel.postMessage({command: "ProcessStatusUpdate", data: this.dataBuffer})
        }
    }

    private updateIconAndBadgetext() {
        let path = "";
        let badgeText: string = "";
        let badgeColor = "";
        switch (this.dataBuffer.state) {
            case Status.GREEN:
                path = "ok";
                /*badgeText = "" + this.dataBuffer.hostup;
                 badgeColor = "#83b225";*/
                break;
            case Status.YELLOW:
                path = "warn";
                badgeText = "" + this.dataBuffer.servicewarnings;
                badgeColor = "#b29a25";
                break;
            case Status.RED:
                path = "err";
                badgeText = "" + (this.dataBuffer.hosterrors + this.dataBuffer.servicewarnings + this.dataBuffer.serviceerrors);
                badgeColor = "#b25425";
                break;
        }
        browser.browserAction.setIcon({
            path: {
                "16": "icons/icon-16" + path + ".png",
                "32": "icons/icon-32" + path + ".png"
            }
        });
        browser.browserAction.setBadgeText({text: badgeText});
        browser.browserAction.setBadgeBackgroundColor({color: badgeColor});
    }
}
