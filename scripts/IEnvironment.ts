/// <reference path="definitions/es6-promise/index.d.ts" />

export class Settings {
    constructor(public timerPeriod = 5) {
    }
}

export interface IEnvironment {
    initTimer(delay: number, callback: () => void): void
    loadSettings(): Promise<Settings>
}
