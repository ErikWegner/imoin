/// <reference path="definitions/firefox-webextension/index.d.ts" />

import { AbstractEnvironment } from "./AbstractEnvironment";
import { Settings } from "./Settings";
import { Monitor } from "./MonitorData";
import Status = Monitor.Status;
import { UICommand } from "./UICommand";

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment extends AbstractEnvironment {
    protected portFromPanel: WebExtension.Port;
    protected abstract host: WebExtension.WebExtensionBrowser;

    protected abstract console: Console;

    protected updateIconAndBadgetext() {
        let path = "";
        let badgeText: string = "";
        let badgeColor = "";
        switch (this.dataBuffer.state) {
            case Status.GREEN:
                path = "ok";
                /*badgeText = "" + this.dataBuffer.hostup;*/
                badgeColor = "#83b225";
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
        this.host.browserAction.setIcon({
            path: {
                "16": "icons/icon-16" + path + ".png",
                "24": "icons/icon-32" + path + ".png",
                "32": "icons/icon-32" + path + ".png"
            }
        });
        this.host.browserAction.setBadgeText({ text: badgeText });
        this.host.browserAction.setBadgeBackgroundColor({ color: badgeColor });
    }


    protected trySendDataToPopup() {
        if (this.portFromPanel) {
            this.portFromPanel.postMessage({ command: "ProcessStatusUpdate", data: this.dataBuffer })
        }
    }

    protected connected(p: WebExtension.Port) {
        this.debug("Panel opened");
        const me = this;
        this.portFromPanel = p;
        this.portFromPanel.onMessage.addListener(this.handleMessage.bind(this));
        this.portFromPanel.onDisconnect.addListener(function () {
            me.debug("Panel closed");
            me.portFromPanel = null;
        });
        this.trySendDataToPopup();
    }

    addAlarm(webExtension: any, delay: number, callback: () => void): void {
        this.debug("Adding alarm every " + delay + " minutes");
        this.onAlarmCallback = callback;
        webExtension.alarms.create(
            "imoin",
            {
                periodInMinutes: delay
            }
        );
        this.debug("Adding alarm listener");
        const me = this;
        webExtension.alarms.onAlarm.addListener(function () {
            me.handleAlarm()
        });
        this.debug("Triggering immediate update");
        callback();
    }

    removeAlarm(webExtension: any) {
        webExtension.alarms.clear("imoin");
        webExtension.alarms.onAlarm.removeListener(this.handleAlarm)
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

    debug(o: any) {
        this.console.debug(o);
    }

    log(o: any) {
        this.console.log(o);
    }

    error(o: any) {
        this.console.error(o);
    }

    protected openWebPage(url: string) {
        this.host.tabs.create({
            url: url
        });
    }
}
