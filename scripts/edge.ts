import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment';
import browser from './definitions/firefox-webextension';
import { IBadgeIcon, IEdgeBadgeIcon } from './IconAndBadgetext';
import { init } from './main';
import { Settings } from './Settings';

/**
 * Implementation for Microsoft Edge
 */
export class Edge extends AbstractWebExtensionsEnvironment {
  protected host = browser;

  protected console = console;

  protected timeoutHandles: { [alarmName: string]: number } = {};

  constructor() {
    super();
    browser.runtime.onConnect.addListener(this.connected.bind(this));
  }

  public loadSettings(): Promise<Settings> {
    return new Promise<Settings>((resolve) => {
      browser.storage.local.get(
        AbstractWebExtensionsEnvironment.optionKeys,
        (data) => {
          this.settings =
            AbstractWebExtensionsEnvironment.processStoredSettings(data);
          resolve(this.settings);
        }
      );
    });
  }

  protected createHostAlarm(alarmName: string, delay: number) {
    if (this.timeoutHandles[alarmName]) {
      this.removeHostAlarm(alarmName);
    }

    this.timeoutHandles[alarmName] = window.setTimeout(() => {
      this.handleAlarm({ name: alarmName });
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
      20: icon['20'],
      40: icon['40'],
    };
    this.host.action.setIcon({ path: onlyEdgeSized });
  }
}

init(new Edge());
