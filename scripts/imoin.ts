import {
  AlarmEvent,
  InstalledEventDetails,
} from './definitions/common-webextension';
import { V3Environment, V3Instance, V3Settings } from './IEnvironment';
import { Logger } from './logger';
import { IcingaApi, MonitorDataV3, MonitorV3 } from './monitors';
import { filterUpV3 } from './monitors/filters/filterUP';
import { FilterSettings } from './Settings';

export class Imoin {
  private settings: V3Settings | null = null;
  private instancesData: MonitorDataV3[] = [];
  private filterSettings: FilterSettings | null = null;

  constructor(
    /** The logger */
    private l: Logger,
    /** Host environmet */
    private h: V3Environment,
  ) {
    // No further setup required here. The activatedEvent gets things started.
  }

  async alarmEvent(alarm: AlarmEvent) {
    this.l.debug('Alarm', JSON.stringify(alarm));
    const [, instanceNumberStr] = alarm.name.match(/i(\d+)/) || [];
    if (instanceNumberStr) {
      const instanceNumber = parseInt(instanceNumberStr, 10);
      if (
        instanceNumber > 0 &&
        instanceNumber <= (this.settings?.instances.length ?? 0)
      ) {
        const instanceIndex = instanceNumber - 1;
        const instance = this.settings?.instances[instanceIndex];
        if (instance) {
          this.l.log(`Handling alarm for instance ${instanceNumber}`);
          const monitor = await this.getMonitor(instance);
          if (monitor) {
            const monitorData = await this.poll(monitor);
            this.instancesData[instanceIndex] = monitorData;
            await this.h.saveInstancesData(this.instancesData);
            this.calculateOverallStatus();
            this.h.sendPanelMessage({ command: 'UpdatePanelData' });
          }
        }
      } else {
        this.l.error(`Invalid instance number: ${instanceNumber}`);
      }
    }
  }

  async poll(monitor: MonitorV3): Promise<MonitorDataV3> {
    return monitor.fetchStatusV3();
  }

  getMonitor(instance: V3Instance): Promise<MonitorV3 | null> {
    if (instance.icingaversion === 'api1') {
      return Promise.resolve(new IcingaApi(null, instance, 0));
    }
    this.l.error(`Unsupported Icinga version: ${instance.icingaversion}`);
    return Promise.resolve(null);
  }

  installedEvent(details: InstalledEventDetails): void {
    this.l.debug('Installed', details.reason);
    if (details.reason === 'install') {
      this.l.log('Opening settings page');
      this.h.openSettingspage();
    }
  }

  /** This function is called when the extension has been (re-)activated */
  async activatedEvent(hasAlarms: boolean) {
    this.l.debug('Activated', hasAlarms);
    this.settings = await this.h.getSettings();
    this.l.debug('Settings loaded');
    if (hasAlarms === false) {
      this.settings?.instances.forEach((instance, index) => {
        this.l.log(`Creating alarm for instance ${index + 1}`);
        void this.h.createAlarm(`i${index + 1}`, instance.timerPeriod);
      });
    }
    this.h.registerAlarmHandler((alarm) => {
      void this.alarmEvent(alarm);
    });
    await this.loadInstancesData();
  }

  async loadInstancesData() {
    this.instancesData = await this.h.getInstancesData();
  }

  private calculateOverallStatus() {
    (this.instancesData ?? []).forEach((instance) =>
      filterUpV3(instance.hosts, this.filterSettings),
    );
  }
}
