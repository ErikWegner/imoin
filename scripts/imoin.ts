import { AlarmEvent } from './definitions/common-webextension';
import { Logger } from './logger';

export class Imoin {
  constructor(private l: Logger) { }

  alarmEvent(alarm: AlarmEvent) {
    this.l.debug('Alarm', alarm);
  }

  installedEvent(): void {
    this.l.debug('Installed');
  }
}
