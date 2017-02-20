import {IEnvironment} from "./IEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";
import {UICommand} from "./UICommand";

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment implements IEnvironment {
    protected onSettingsChangedCallback: () => void;
    private onAlarmCallback: () => void;
    private onUICommandCallback: (param: UICommand) => void;

    abstract loadSettings(): Promise<Settings>

    abstract initTimer(delay: number, callback: () => void): void

    abstract stopTimer(): void

    abstract console(): Console

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

    abstract displayStatus(data: Monitor.MonitorData): void

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
        this.console().debug(o);
    }

    log(o: any) {
        this.console().log(o);
    }

    error(o: any) {
        this.console().error(o);
    }
}
