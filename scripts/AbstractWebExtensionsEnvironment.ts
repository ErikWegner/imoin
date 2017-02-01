import {IEnvironment} from "./IEnvironment";
import {Settings} from "./Settings";

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment implements IEnvironment {
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

