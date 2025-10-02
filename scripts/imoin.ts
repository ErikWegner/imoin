import {
  AlarmEvent,
  InstalledEventDetails,
} from './definitions/common-webextension';
import { V3Environment, V3Instance, V3Settings } from './IEnvironment';
import { Logger } from './logger';
import { IcingaApi, MonitorV3 } from './monitors';

export class Imoin {
  private settings: V3Settings | null = null;

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
    const [_, instanceNumberStr] = alarm.name.match(/i(\d+)/) || [];
    if (instanceNumberStr) {
      const instanceNumber = parseInt(instanceNumberStr, 10);
      if (instanceNumber > 0 && instanceNumber <= (this.settings?.instances.length ?? 0)) {
        const instance = this.settings?.instances[instanceNumber - 1];
        if (instance) {
          this.l.log(`Handling alarm for instance ${instanceNumber}`);
          const monitor = await this.getMonitor(instance);
          if (monitor) {
            this.poll(monitor);
          }
        }
      }
    }
  }

  async poll(monitor: MonitorV3): Promise<void> {
    const status = await monitor.fetchStatusV3();
  }

  async getMonitor(instance: V3Instance): Promise<MonitorV3 | null> {
    if (instance.icingaversion === 'nagioscore') {
      return new IcingaApi(null, instance, 0);
    }
    this.l.error(`Unsupported Icinga version: ${instance.icingaversion}`);
    return null;
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
        this.h.createAlarm(`i${index + 1}`, instance.timerPeriod);
      });
    }
    this.h.registerAlarmHandler((alarm) => {
      this.alarmEvent(alarm);
    });
  }
}
