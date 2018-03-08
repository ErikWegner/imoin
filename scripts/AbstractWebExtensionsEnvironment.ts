import { browser } from './definitions/firefox-webextension/index';
import { AbstractEnvironment } from './AbstractEnvironment';
import { Settings } from './Settings';
import { Monitor } from './monitors';
import Status = Monitor.Status;
import { IBadgeIcon } from './IconAndBadgetext';

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment extends AbstractEnvironment {
    /**
     * Build the id to lookup the sound settings
     * @param status The overall status
     * @param isNew A flag indicating that the status is different to the last call
     */
    public static buildSoundId(status: Monitor.Status, isNew: boolean): string {
        return (isNew ? 'To' : '') + Monitor.Status[status];
    }

    public static processStoredSettings(storedSettings: any): Settings {
        const settings = new Settings();
        if (storedSettings.instances) {
            settings.instances = JSON.parse(storedSettings.instances);
        }
        if (storedSettings.fontsize && storedSettings.fontsize > 0) {
            settings.fontsize = storedSettings.fontsize;
        }
        if (storedSettings.sounds) {
            settings.sounds = JSON.parse(storedSettings.sounds);
        }

        // Remove trailing slash for all instances
        settings.instances.forEach((i) => i.url = Settings.urlNoTrailingSlash(i));

        return settings;
    }

    protected static optionKeys = ['instances', 'fontsize', 'sounds'];

    protected portFromPanel: WebExtension.Port;
    protected abstract host: WebExtension.WebExtensionBrowser;
    protected abstract console: Console;
    protected settings: Settings = new Settings();

    private alarmListenerRegistered = false;
    private audioPlayer: HTMLAudioElement = new Audio();
    private audioPlayerSoundid: string = '';

    public load(url: string, username: string, password: string): Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                if (username) {
                    xhr.setRequestHeader(
                        'Authorization', 'Basic ' + btoa(username + ':' + password));
                    xhr.withCredentials = true;
                }
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
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

    public post(url: string, data: any, username: string, password: string): Promise<string> {
        return new Promise<string>(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, true);
                if (username) {
                    xhr.setRequestHeader(
                        'Authorization', 'Basic ' + btoa(username + ':' + password));
                    xhr.withCredentials = true;
                }
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
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
        );
    }
    public initTimer(index: number, delay: number, callback: () => void): void {
        this.addAlarm(index, delay, callback);
    }

    public stopTimer(index: number) {
        this.removeAlarm(index);
    }

    public audioNotification(status: Monitor.Status, isNew: boolean): void {
        // Build the key
        const soundid = AbstractWebExtensionsEnvironment.buildSoundId(status, isNew);

        // Is it still playing?
        if (this.audioPlayer.paused === false) {
            // Is it still playing the last sound?
            if (this.audioPlayerSoundid === soundid) {
                // do nothing
                return;
            }
            // Stop running player
            this.audioPlayer.pause();
        }

        // Lookup settings
        if (this.settings.sounds[soundid]) {
            // Remember sound id
            this.audioPlayerSoundid = soundid;

            // Start player
            this.audioPlayer.src = this.settings.sounds[soundid].data;
            this.audioPlayer.play();
        }
    }

    protected setIcon(icon: IBadgeIcon) {
        this.host.browserAction.setIcon({ path: icon });
    }

    protected updateIconAndBadgetext() {
        const iAndB = AbstractEnvironment.prepareIconAndBadgetext(this.dataBuffer);
        this.setIcon(iAndB.badgeIcon);
        this.host.browserAction.setBadgeText({ text: iAndB.badgeText });
        this.host.browserAction.setBadgeBackgroundColor({ color: iAndB.badgeColor });
    }

    protected trySendDataToPopup() {
        if (this.portFromPanel) {
            this.portFromPanel.postMessage(
                { command: 'ProcessStatusUpdate', data: this.dataBuffer });
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
        this.portFromPanel.onDisconnect.addListener(() => {
            me.debug('Panel closed');
            me.portFromPanel = null;
        });
        this.trySendDataToPopup();
    }

    protected createHostAlarm(alarmName: string, delay: number) {
        this.host.alarms.create(
            alarmName,
            {
                periodInMinutes: delay
            }
        );

        this.debug('Adding alarm listener');
        if (!this.alarmListenerRegistered) {
            this.alarmListenerRegistered = true;
            this.host.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
        }
    }

    protected removeHostAlarm(alarmName: string) {
        this.host.alarms.clear(alarmName);
    }

    protected addAlarm(index: number, delay: number, callback: () => void): void {
        this.debug('Adding alarm every ' + delay + ' minutes');
        const alarmName = AbstractEnvironment.alarmName(index);

        this.createHostAlarm(alarmName, delay);

        this.registerAlarmCallback(alarmName, callback);

        this.debug('Triggering immediate update');
        this.handleAlarm({ name: alarmName });
    }

    protected removeAlarm(index: number) {
        const alarmName = AbstractEnvironment.alarmName(index);
        this.removeHostAlarm(alarmName);
    }

    protected debug(o: any) {
        this.console.debug(o);
    }

    protected log(o: any) {
        this.console.log(o);
    }

    protected error(o: any) {
        this.console.error(o);
    }

    protected openWebPage(url: string) {
        this.host.tabs.create({ url });
    }
}
