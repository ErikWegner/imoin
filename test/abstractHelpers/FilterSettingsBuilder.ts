import { ImoinMonitorInstance, FilterSettings } from '../../scripts/Settings';

export class FilterSettingsBuilder {
  public static plain() {
    return new FilterSettingsBuilder();
  }

  public static with(instance: ImoinMonitorInstance) {
    return new FilterSettingsBuilder(instance);
  }

  private filtersettings: FilterSettings;

  constructor(private instance?: ImoinMonitorInstance) {
    this.filtersettings = {
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
    if (this.instance) {
      this.instance.filtersettings = this.filtersettings;
    }
  }

  public filterOutAcknowledged() {
    this.filtersettings.filterOutAcknowledged = true;
    return this;
  }

  public build() {
    return this.filtersettings;
  }
}
