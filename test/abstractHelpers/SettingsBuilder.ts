import { IcingaOptionsVersion, ImoinMonitorInstance } from '../../scripts/Settings.js';

export class SettingsBuilder {
  public static create(version: IcingaOptionsVersion) {
    return new SettingsBuilder(version);
  }

  constructor(private version: IcingaOptionsVersion) {
  }

  public build(): ImoinMonitorInstance {
    return {
      icingaversion: this.version,
      instancelabel: 'unittest',
      url: 'testurl',
      timerPeriod: 5,
      username: 'user',
      password: 'pass',
    };
  }
}
