/// <reference path="definitions/es6-promise/index.d.ts" />


import {Monitor} from "./MonitorData";
import MonitorData = Monitor.MonitorData;

export interface IMonitor {
    fetchStatus(): Promise<MonitorData>
}