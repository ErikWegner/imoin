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

const remoteLog = (level: string, ...args: unknown[]) => {
  void fetch('http://localhost:3000/log', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      message: args.join(' '),
      level,
    }),
  });
};


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
    const savedData = data?.imoin;
    if (
      !savedData ||
      typeof savedData === 'undefined' ||
      savedData.length === 0
    ) {
      return;
    }

    this.debug('Restoring saved data');

    const tmp = AbstractWebExtensionsEnvironment.createUpdatePendingResult();
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
        s.setState(
          serviceData.s === 'OK'
            ? 'OK'
            : serviceData.s === 'WARNING'
              ? 'WARNING'
              : 'CRITICAL',
        );
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
      tmp.updateCounters();
      tmp.addHost(h);
    });
    this.dataBuffer.addCountersAndMergeState(tmp);
  }

  private remoteLog = (level: string, ...args: unknown[]) => {
    return;
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
      remoteLog('info', ...args);
    },
    error: (...args: unknown[]) => {
      console.error(...args);
      remoteLog('error', ...args);
    },
    debug: (...args: unknown[]) => {
      console.debug(...args);
      remoteLog('debug', ...args);
    },
  };

  constructor() {
    super();
    this.debug('Initializing Chrome extension');
    chrome.runtime.onConnect.addListener(this.connected.bind(this));
    void (async () => {
      remoteLog('debug', 'Read data (constructor)');
      await this.readData();
      remoteLog('debug', 'Handle new data (constructor)');
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

  protected override createHostAlarm(alarmName: string, delay: number) {
    void (async () => {
      const alarm = await this.host.alarms.get(alarmName);
      if (!alarm) {
        this.debug('Adding alarm ' + alarmName);
        this.host.alarms.create(alarmName, {
          periodInMinutes: delay,
        });
      } else {
        this.debug('Alarm already exists ' + alarmName);
      }
    })();

    this.registerAlarmHandler();
  }
}

init(new Chrome());
