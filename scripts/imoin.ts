import { AlarmEvent } from './definitions/common-webextension';
import { V3Environment } from './IEnvironment';
import { Logger } from './logger';

export class Imoin {
  constructor(
    /** The logger */
    private l: Logger,
    /** Host environmet */
    private h: V3Environment,
  ) {
    // No further setup required here. The installedEvent gets things started.
  }

  alarmEvent(alarm: AlarmEvent) {
    this.l.debug('Alarm', JSON.stringify(alarm));
  }

  installedEvent(): void {
    this.l.debug('Installed');
    void this.h.createAlarm('i1', 1);
  }
}
