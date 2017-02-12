/// <reference path="definitions/es6-promise/index.d.ts" />

import {Monitor} from "./MonitorData";
import MonitorData = Monitor.MonitorData;
import {IEnvironment} from "./IEnvironment";
import {Settings} from "./Settings";

export interface IMonitor {
    init(environment: IEnvironment, settings: Settings): void
    startTimer(): void
}