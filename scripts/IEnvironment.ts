/// <reference path="definitions/es6-promise/index.d.ts" />

import {Settings} from "./Settings";
export interface IEnvironment {
    initTimer(delay: number, callback: () => void): void
    loadSettings(): Promise<Settings>
}
