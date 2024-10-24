import { AbstractAudioPlayer } from './AbstractAudioPlayer.js';
import { AbstractEnvironment } from './AbstractEnvironment.js';
import {
  Port,
  WebExtensionBrowser,
} from './definitions/common-webextension/index.js';
import { IBadgeIcon } from './IconAndBadgetext.js';
import { Status } from './monitors/index.js';
import { ImoinMonitorInstance, Settings, Sound } from './Settings.js';

/**
 * A common implementation
 */
export abstract class AbstractWebExtensionsEnvironment extends AbstractEnvironment {
  public onStartup(handler: () => void): void {
    this.host.runtime.onStartup.addListener(() => handler());
  }
  /**
   * Build the id to lookup the sound settings
   * @param status The overall status
   * @param isNew A flag indicating that the status is different to the last call
   */
  public static buildSoundId(status: Status, isNew: boolean): string {
    return (isNew ? 'To' : '') + Status[status];
  }

  public static processStoredSettings(
    storedSettings: Record<string, unknown>,
  ): Settings {
    const settings = new Settings();
    if (storedSettings && typeof storedSettings === 'object') {
      if (typeof storedSettings.instances === 'string') {
        settings.instances = JSON.parse(
          storedSettings.instances,
        ) as ImoinMonitorInstance[];
      }
      if (
        typeof storedSettings.fontsize === 'number' &&
        storedSettings.fontsize > 0
      ) {
        settings.fontsize = storedSettings.fontsize;
      }
      settings.inlineresults = storedSettings.inlineresults === 1;
      if (typeof storedSettings.sounds === 'string') {
        settings.sounds = JSON.parse(storedSettings.sounds) as Record<
          string,
          Sound
        >;
      }
    }

    // Remove trailing slash for all instances
    settings.instances.forEach((i) => (i.url = Settings.urlNoTrailingSlash(i)));

    return settings;
  }

  protected static optionKeys = [
    'instances',
    'fontsize',
    'sounds',
    'inlineresults',
  ];

  protected portFromPanel: Port | null = null;
  protected abstract host: WebExtensionBrowser;
  protected abstract console: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
  };
  protected settings: Settings = new Settings();

  private alarmListenerRegistered = false;
  private audioPlayer = new AbstractAudioPlayer();
  private audioPlayerSoundid = '';

  public async load(
    url: string,
    username: string,
    password: string,
  ): Promise<string> {
    const headers = new Headers();
    if (username) {
      headers.append(
        'Authorization',
        'Basic ' + btoa(username + ':' + password),
      );
    }
    const res = await fetch(url, {
      headers,
      method: 'GET',
    });
    if (res.status === 200) {
      return res.text();
    }
    throw new Error(`Network failure: ${res.status} ${res.statusText}`);
  }

  public async post(
    url: string,
    data: object,
    username: string,
    password: string,
  ): Promise<string> {
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    if (username) {
      headers.append(
        'Authorization',
        'Basic ' + btoa(username + ':' + password),
      );
    }
    const res = await fetch(url, {
      headers,
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.status === 200) {
      return res.text();
    }
    throw new Error(`Network failure: ${res.status} ${res.statusText}`);
  }

  public initTimer(index: number, delay: number, callback: () => void): void {
    this.addAlarm(index, delay, callback);
  }

  public stopTimer(index: number) {
    this.removeAlarm(index);
  }

  public registerAlarmHandler() {
    this.log('Registering alarm handler');
    this.host.alarms.onAlarm.addListener((alarm) => {
      this.log('Alarm received:', alarm.name);
    });
  }

  public audioNotification(status: Status, isNew: boolean): void {
    // Build the key
    const soundid = AbstractWebExtensionsEnvironment.buildSoundId(
      status,
      isNew,
    );

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
      if (this.settings.sounds[soundid].data) {
        this.audioPlayer.play(this.settings.sounds[soundid].data);
      }
    }
  }

  protected openOptionsPage(): void {
    if (this.host.runtime.openOptionsPage) {
      this.host.runtime.openOptionsPage();
    } else {
      window.open(this.host.runtime.getURL('html/options.html'));
    }
  }

  protected setIcon(icon: IBadgeIcon) {
    this.host.action.setIcon({ path: icon });
  }

  protected updateIconAndBadgetext() {
    const iAndB = AbstractEnvironment.prepareIconAndBadgetext(this.dataBuffer);
    this.setIcon(iAndB.badgeIcon);
    this.host.action.setBadgeText({ text: iAndB.badgeText });
    this.host.action.setBadgeBackgroundColor({
      color: iAndB.badgeColor,
    });
  }

  protected trySendDataToPopup() {
    if (this.portFromPanel) {
      this.portFromPanel.postMessage({
        command: 'ProcessStatusUpdate',
        data: this.dataBuffer,
      });
      this.portFromPanel.postMessage({
        command: 'uisettings',
        data: {
          fontsize: this.settings.fontsize,
          inlineresults: this.settings.inlineresults,
        },
      });
    }
  }

  protected connected(p: Port) {
    this.debug('Panel opened');
    this.portFromPanel = p;
    this.portFromPanel.onMessage.addListener(this.handleMessage.bind(this));
    this.portFromPanel.onDisconnect.addListener(() => {
      this.debug('Panel closed');
      this.portFromPanel = null;
    });
    this.trySendDataToPopup();
  }

  protected createHostAlarm(alarmName: string, delay: number) {
    this.host.alarms.create(alarmName, {
      periodInMinutes: delay,
    });

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
    this.debug(`Adding alarm every ${delay} minutes`);
    const alarmName = AbstractEnvironment.alarmName(index);

    this.createHostAlarm(alarmName, delay);

    this.registerAlarmCallback(alarmName, callback);
  }

  protected removeAlarm(index: number) {
    const alarmName = AbstractEnvironment.alarmName(index);
    this.removeHostAlarm(alarmName);
  }

  protected debug(...o: unknown[]) {
    this.console.debug(...o);
  }

  protected log(...o: unknown[]) {
    this.console.log(...o);
  }

  protected error(...o: unknown[]) {
    this.console.error(...o);
  }

  protected openWebPage(url: string) {
    this.host.tabs.create({ url });
  }
}
