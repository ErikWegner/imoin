/// <reference path="definitions/es6-promise/index.d.ts" />

import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";
import MonitorData = Monitor.MonitorData;
import {UICommand} from "./UICommand";

export interface IEnvironment {
    /* Execute the callback at every delay minutes */
    initTimer(delay: number, callback: () => void): void;

    /* Disable the timer */
    stopTimer(): void;

    /* Execute the callback when the settings have changed */
    onSettingsChanged(callback: () => void): void;

    /* Get the settigs from the storage */
    loadSettings(): Promise<Settings>;

    /* Update the UI to reflect the updated status data */
    displayStatus(data: MonitorData): void;

    /* Load a resource */
    load(url: string, username: string, password: string): Promise<string>;

    /* Send a post request */
    post(url: string, data: any, username: string, password: string): Promise<string>;

    /* UICommand for the monitor instance */
    onUICommand(callback: (param: UICommand) => void): void;

}
