/// <reference path='definitions/chrome-webextension/index.d.ts' />

import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment';
import { Settings } from './Settings';
import { Monitor } from './MonitorData';
import Status = Monitor.Status;
import { init } from './main';
import { IBadgeIcon, IEdgeBadgeIcon } from './IconAndBadgetext';

/**
 * Implementation for Microsoft Edge
 */
export class Edge extends AbstractWebExtensionsEnvironment {
    protected host = browser

    protected console = console;

    protected timeoutHandles: { [alarmName: string]: number } = {};

    constructor() {
        super();
        browser.runtime.onConnect.addListener(this.connected.bind(this));
    }

    loadSettings(): Promise<Settings> {
        const i = this;
        return new Promise<Settings>(
            (resolve, reject) => {
                browser.storage.local.get(
                    AbstractWebExtensionsEnvironment.optionKeys,
                    (data) => {
                        i.settings = AbstractWebExtensionsEnvironment.processStoredSettings(data);
                        resolve(i.settings);
                    });
            }
        )
    }

    protected createHostAlarm(alarmName: string, delay: number) {
        if (this.timeoutHandles[alarmName]) {
            this.removeHostAlarm(alarmName);
        }

        this.timeoutHandles[alarmName] = window.setTimeout(() => {
            this.handleAlarm({ name: alarmName })
        }, delay * 60000);
    }

    protected removeHostAlarm(alarmName: string) {
        if (this.timeoutHandles[alarmName]) {
            window.clearTimeout(this.timeoutHandles[alarmName]);
            this.timeoutHandles[alarmName] = 0;
        }
    }

    protected setIcon(icon: IBadgeIcon) {
        const onlyEdgeSized: IEdgeBadgeIcon = {
            20: icon["20"],
            40: icon["40"],
        }
        this.host.browserAction.setIcon({ path: onlyEdgeSized });
    }

}

init(new Edge());
