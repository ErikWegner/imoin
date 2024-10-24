import { AbstractWebExtensionsEnvironment } from './AbstractWebExtensionsEnvironment.js';
import chrome from './definitions/chrome-webextension/index.js';
import { init } from './main.js';
import {
  Host,
  SerializedHost,
  SerializedService,
  Service,
} from './monitors/MonitorData.js';
import { Settings } from './Settings.js';

/**
 * Implementation for Chrome
 */
export class Chrome extends AbstractWebExtensionsEnvironment {
  protected host = chrome;

  protected saveData(): Promise<void> {
    this.debug('Saving data');
    return this.host.storage.local.set({
      imoin: this.dataBuffer.serialize(),
    });
  }

  protected async readData(): Promise<void> {
    this.debug('Loading data');
    const data = (await this.host.storage.local.get('imoin')) as {
      imoin: Partial<SerializedHost<Partial<SerializedService>>>[];
    };
    this.dataBuffer =
      AbstractWebExtensionsEnvironment.createUpdatePendingResult();
    // const savedData = new Array(...(data?.imoin ?? []));
    const savedData = data?.imoin;
    if (
      !savedData ||
      typeof savedData === 'undefined' ||
      savedData.length === 0
    ) {
      return;
    }

    savedData.forEach((hostdata) => {
      const h = new Host(hostdata.n ?? '<empty>');
      h.setState(hostdata.s === 'UP' ? 'UP' : 'DOWN');
      h.hostlink = hostdata.hl;
      h.hasBeenAcknowledged = hostdata.ack ?? false;
      h.notificationsDisabled = hostdata.nd ?? false;
      h.checksDisabled = hostdata.cd ?? false;
      h.isInSoftState = hostdata.soft ?? false;
      h.isInDowntime = hostdata.dt ?? false;
      h.checkresult = hostdata.r;
      h.instanceindex = hostdata.ii ?? 0;
      h.appearsInShortlist = hostdata.sl ?? false;

      (hostdata.srv ?? []).forEach((serviceData) => {
        const s = new Service(serviceData.n ?? '<empty>');
        s.host = h.name;
        s.checkresult = serviceData.r;
        s.servicelink = serviceData.vl;
        s.hasBeenAcknowledged = serviceData.ack ?? false;
        s.notificationsDisabled = serviceData.nd ?? false;
        s.checksDisabled = serviceData.cd ?? false;
        s.isInSoftState = serviceData.soft ?? false;
        s.isInDowntime = serviceData.dt ?? false;
        s.appearsInShortlist = serviceData.sl ?? false;

        h.services.push(s);
      });

      this.dataBuffer.addHost(h);
    });
  }

  private remoteLog = (level: string, ...args: unknown[]) => {
    void this.post(
      'http://localhost:3000/log',
      {
        message: args.join(' '),
        level,
      },
      '',
      '',
    );
  };

  protected console = {
    log: (...args: unknown[]) => {
      console.log(...args);
      this.remoteLog('info', ...args);
    },
    error: (...args: unknown[]) => {
      console.error(...args);
      this.remoteLog('error', ...args);
    },
    debug: (...args: unknown[]) => {
      console.debug(...args);
      this.remoteLog('debug', ...args);
    },
  };

  constructor() {
    super();
    chrome.runtime.onConnect.addListener(this.connected.bind(this));
    void (async () => {
      await this.readData();
      this.handleNewData();
    })();
  }

  public loadSettings(): Promise<Settings> {
    return new Promise<Settings>((resolve) => {
      chrome.storage.local.get(
        AbstractWebExtensionsEnvironment.optionKeys,
        (data) => {
          this.settings =
            AbstractWebExtensionsEnvironment.processStoredSettings(data);
          resolve(this.settings);
        },
      );
    });
  }
}

init(new Chrome());
