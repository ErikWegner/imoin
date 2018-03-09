import { ImoinMonitorInstance } from '../../scripts/Settings';

export class FilterSettingsBuilder {
  public static with(instance: ImoinMonitorInstance) {
    return new FilterSettingsBuilder(instance);
  }

  constructor(private instance: ImoinMonitorInstance) {
    this.instance.filtersettings = {
      filterOutAcknowledged: false,
      filterOutDisabledNotifications: false,
      filterOutDisabledChecks: false,
      filterOutSoftStates: false,
      filterOutDowntime: false,
      filterOutServicesOnDownHosts: false,
      filterOutServicesOnAcknowledgedHosts: false,
      filterOutFlapping: false,
      filterOutAllDown: false,
      filterOutAllUnreachable: false,
      filterOutAllUnknown: false,
      filterOutAllWarning: false,
      filterOutAllCritical: false,
      filterHosts: null,
      filterServices: null,
      filterInformation: null,
    };
  }

  public filterOutAcknowledged() {
    this.instance.filtersettings.filterOutAcknowledged = true;
    return this;
  }
}
