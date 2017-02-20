import {IEnvironment} from "./IEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";
import Status = Monitor.Status;
import {UICommand} from "./UICommand";

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment implements IEnvironment {
    protected dataBuffer: Monitor.MonitorData;
    protected portFromPanel: WebExtension.Port;
    protected onSettingsChangedCallback: () => void;
    private onAlarmCallback: () => void;
    private onUICommandCallback: (param: UICommand) => void;

    abstract loadSettings(): Promise<Settings>

    abstract initTimer(delay: number, callback: () => void): void

    abstract stopTimer(): void

    protected abstract host: WebExtension.WebExtensionBrowser;

    protected abstract console: Console;

    protected updateIconAndBadgetext() {
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
        this.host.browserAction.setIcon({
            path: {
                "16": "icons/icon-16" + path + ".png",
                "24": "icons/icon-32" + path + ".png",
                "32": "icons/icon-32" + path + ".png"
            }
        });
        if (badgeText) {
            this.host.browserAction.setBadgeText({text: badgeText});
        }
        if (badgeColor) {
            this.host.browserAction.setBadgeBackgroundColor({color: badgeColor});
        }
    }

    
    protected trySendDataToPopup() {
        if (this.portFromPanel) {
            this.portFromPanel.postMessage({command: "ProcessStatusUpdate", data: this.dataBuffer})
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

    protected handleMessage(request: any, sender: any, sendResponse: (message: any) => void) {
        const command = request.command || "";

        if (command == "triggerRefresh") {
            this.handleAlarm();
        }

        if (command == "triggerOpenPage") {
            if (typeof (command.url) !== "undefined" && command.url != "") {
                this.host.tabs.create({
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

    handleAlarm() {
        this.debug("Periodic alarm");
        if (this.onAlarmCallback != null) {
            this.onAlarmCallback();
        }
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

    onSettingsChanged(callback: () => void) {
        this.onSettingsChangedCallback = callback
    }

    onUICommand(callback: (param: UICommand) => void): void {
        this.onUICommandCallback = callback;
    }

    emitUICommand(param: UICommand) {
        if (this.onUICommandCallback != null) {
            this.onUICommandCallback(param);
        }
    }

    notifySettingsChanged() {
        if (this.onSettingsChangedCallback != null) {
            this.onSettingsChangedCallback();
        }
    }

    displayStatus(data: Monitor.MonitorData): void {
        this.debug("displayStatus");
        this.dataBuffer = data;
        this.updateIconAndBadgetext();
        this.trySendDataToPopup();
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
}
