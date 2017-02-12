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
        if (this.onAlarmCallback != null) {
            this.onAlarmCallback();
        }
    }

    addAlarm(webExtension: any, delay: number, callback: () => void): void {
        this.onAlarmCallback = callback;
        webExtension.alarms.create(
            "imoin",
            {
                periodInMinutes: delay
            }
        )
        webExtension.alarms.onAlarm.addListener(this.handleAlarm)

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

    abstract load(url: string): Promise<string>
}

