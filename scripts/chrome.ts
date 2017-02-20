/// <reference path="definitions/firefox-webextension/index.d.ts" />

import {AbstractWebExtensionsEnvironment} from "./AbstractWebExtensionsEnvironment";
import {Settings} from "./Settings";
import {Monitor} from "./MonitorData";
import Status = Monitor.Status;
import {EnvironmentFactory} from "./IEnvironment";

/**
 * Implementation for Chrome
 */
export class Chrome extends AbstractWebExtensionsEnvironment {

    loadSettings(): Promise<Settings> {
        return null;
    }

    initTimer(delay: number, callback: () => void): void {
    }

    stopTimer(): void {
    }

    displayStatus(data: Monitor.MonitorData): void {
    }

    load(url: string, username: string, password: string): Promise<string> {
        return null;
    }

    post(url: string, data: any, username: string, password: string): Promise<string> {
        return null;
    }
}

EnvironmentFactory.registerFactory(() => new Chrome());