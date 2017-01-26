import {IEnvironment} from "./IEnvironment";
declare var browser: any

export class Firefox implements IEnvironment {

    initAlarmAndCallback(delay: number, callback: () => void): void {
        browser.alarms.create(
            "imoin",
            {
                delayInMinutes: delay
            }
        )
        browser.alarms.onAlarm.addListener((alarm: any) => {
            callback();
        })
    }

}