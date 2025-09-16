import {
  AlarmEvent,
  InstalledEventDetails,
} from './definitions/common-webextension';
import { V3Environment } from './IEnvironment';
import { Logger } from './logger';
import { IMonitor } from './monitors';

export class Imoin {
  constructor(
    /** The logger */
    private l: Logger,
    /** Host environmet */
    private h: V3Environment,
  ) {
    // No further setup required here. The activatedEvent gets things started.
  }

  alarmEvent(alarm: AlarmEvent) {
    this.l.debug('Alarm', JSON.stringify(alarm));
  }

  installedEvent(details: InstalledEventDetails): void {
    this.l.debug('Installed', details.reason);
    if (details.reason === 'install') {
      this.l.log('Opening settings page');
    }
  }

  /** This function is called when the extension has been (re-)activated */
  async activatedEvent(hasAlarms: boolean) {
    this.l.debug('Activated', hasAlarms);
    if (hasAlarms === false) {
      await this.h.createAlarm('i1', 1);
    }
    this.h.registerAlarmHandler((alarm) => {
      this.alarmEvent(alarm);
    });
  }

  private async getMonitorInstanceByName(name: string): IMonitor | null {
    const settings = await this.h.getSettings();
    const index = Number(name.split('-')[1]);
    return settings.instances[index];
  }
}
