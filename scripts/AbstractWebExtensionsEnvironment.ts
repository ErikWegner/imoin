/// <reference path='definitions/firefox-webextension/index.d.ts' />

import { AbstractEnvironment } from './AbstractEnvironment';
import { Settings } from './Settings';
import { Monitor } from './MonitorData';
import Status = Monitor.Status;

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment extends AbstractEnvironment {
    protected portFromPanel: WebExtension.Port;
    protected abstract host: WebExtension.WebExtensionBrowser;
    protected abstract console: Console;
    protected static optionKeys = ['instances', 'fontsize'];
    protected settings: Settings = new Settings();

    private alarmListenerRegistered = false;
    private audioPlayer: HTMLAudioElement;

    protected updateIconAndBadgetext() {
        let iAndB = AbstractEnvironment.prepareIconAndBadgetext(this.dataBuffer);
        this.host.browserAction.setIcon({ path: iAndB.badgeIcon });
        this.host.browserAction.setBadgeText({ text: iAndB.badgeText });
        this.host.browserAction.setBadgeBackgroundColor({ color: iAndB.badgeColor });
    }

    protected trySendDataToPopup() {
        if (this.portFromPanel) {
            this.portFromPanel.postMessage({ command: 'ProcessStatusUpdate', data: this.dataBuffer });
            this.portFromPanel.postMessage({
                command: 'uisettings',
                data: {
                    fontsize: this.settings.fontsize
                }
            });
        }
    }

    protected connected(p: WebExtension.Port) {
        this.debug('Panel opened');
        const me = this;
        this.portFromPanel = p;
        this.portFromPanel.onMessage.addListener(this.handleMessage.bind(this));
        this.portFromPanel.onDisconnect.addListener(function () {
            me.debug('Panel closed');
            me.portFromPanel = null;
        });
        this.trySendDataToPopup();
    }

    addAlarm(index: number, delay: number, callback: () => void): void {
        this.debug('Adding alarm every ' + delay + ' minutes');
        const alarmName = AbstractEnvironment.alarmName(index);

        this.host.alarms.create(
            alarmName,
            {
                periodInMinutes: delay
            }
        );
        this.debug('Adding alarm listener');
        this.registerAlarmCallback(alarmName, callback);
        const me = this;
        if (!this.alarmListenerRegistered) {
            this.alarmListenerRegistered = true;
            this.host.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
        }
        this.debug('Triggering immediate update');
        this.handleAlarm({ name: alarmName });
    }

    removeAlarm(index: number) {
        const alarmName = 'imoin-' + index;
        this.host.alarms.clear(alarmName);
    }

    load(url: string, username: string, password: string): Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                if (username) {
                    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
                    xhr.withCredentials = true;
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(xhr.responseText);
                        }
                    }
                };
                xhr.send();
            }
        );
    }

    post(url: string, data: any, username: string, password: string): Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                if (username) {
                    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
                    xhr.withCredentials = true;
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(xhr.responseText);
                        }
                    }
                };
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(data));
            }
        )
    }

    debug(o: any) {
        this.console.debug(o);
    }

    log(o: any) {
        this.console.log(o);
    }

    error(o: any) {
        this.console.error(o);
    }

    protected openWebPage(url: string) {
        this.host.tabs.create({
            url: url
        });
    }

    initTimer(index: number, delay: number, callback: () => void): void {
        this.addAlarm(index, delay, callback);
    }

    stopTimer(index: number) {
        this.removeAlarm(index);
    }

    public static processStoredSettings(storedSettings: any): Settings {
        const settings = new Settings();
        if (storedSettings.instances) {
            settings.instances = JSON.parse(storedSettings.instances);
        }
        if (storedSettings.fontsize && storedSettings.fontsize > 0) {
            settings.fontsize = storedSettings.fontsize;
        }

        // Remove trailing slash for all instances
        settings.instances.forEach((i) => i.url = Settings.urlNoTrailingSlash(i));

        return settings;
    }

    public audioNotification(status: Monitor.Status): void {
        this.debug(status);
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer = null;
        }

        const source = 'alarm.mp3';
        this.audioPlayer = new Audio(source);
        this.audioPlayer.play();
    }
}
