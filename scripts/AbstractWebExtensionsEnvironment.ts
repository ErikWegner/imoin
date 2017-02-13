import {IEnvironment} from "./IEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment implements IEnvironment {
    protected onSettingsChangedCallback: () => void
    private onAlarmCallback: () => void

    abstract loadSettings(): Promise<Settings>

    abstract initTimer(delay: number, callback: () => void): void

    abstract stopTimer(): void

    handleAlarm() {
        console.log("Periodic alarm");
        if (this.onAlarmCallback != null) {
            this.onAlarmCallback();
        }
    }

    addAlarm(webExtension: any, delay: number, callback: () => void): void {
        console.log("Adding alarm every " + delay + " minutes");
        this.onAlarmCallback = callback;
        webExtension.alarms.create(
            "imoin",
            {
                periodInMinutes: delay
            }
        )
        console.log("Adding alarm listener")
        var me = this
        webExtension.alarms.onAlarm.addListener(function() {
            me.handleAlarm()
        })
        console.log("Triggering immediate update")
        callback();
    }

    removeAlarm(webExtension: any) {
        webExtension.alarms.clear("imoin");
        webExtension.alarms.onAlarm.removeListener(this.handleAlarm)
    }

    onSettingsChanged(callback: () => void) {
        this.onSettingsChangedCallback = callback
    }

    notifySettingsChanged() {
        if (this.onSettingsChangedCallback != null) {
            this.onSettingsChangedCallback();
        }
    }

    abstract displayStatus(data: Monitor.MonitorData): void

    abstract load(url: string, username: string, password: string): Promise<string>
}

