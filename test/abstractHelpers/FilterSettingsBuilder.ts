import { ImoinMonitorInstance, FilterSettings } from '../../scripts/Settings.js';

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

  public setup(f: (sb: FilterSettingsBuilder) => void) {
    f(this);
    return this;
  }

  public filterOutAcknowledged() {
    this.filtersettings.filterOutAcknowledged = true;
    return this;
  }

  public filterOutSoftStates() {
    this.filtersettings.filterOutSoftStates = true;
    return this;
  }

  public filterOutNotificationDisabled() {
    this.filtersettings.filterOutDisabledNotifications = true;
    return this;
  }

  public filterOutDisabledChecks() {
    this.filtersettings.filterOutDisabledChecks = true;
    return this;
  }

  public filterOutServicesOnDownHosts() {
    this.filtersettings.filterOutServicesOnDownHosts = true;
    return this;
  }

  public filterOutServicesOnAcknowledgedHosts() {
    this.filtersettings.filterOutServicesOnAcknowledgedHosts = true;
    return this;
  }

  public filterOutDowntime() {
    this.filtersettings.filterOutDowntime = true;
    return this;
  }

  public filterRemoveByRegexHost(re: string) {
    this.filtersettings.filterHosts = {
      state: 'remove',
      re,
    }
    return this;
  }

  public filterKeepByRegexHost(re: string) {
    this.filtersettings.filterHosts = {
      state: 'keep',
      re,
    }
    return this;
  }

  public filterRemoveByRegexService(re: string) {
    this.filtersettings.filterServices = {
      state: 'remove',
      re,
    }
    return this;
  }

  public filterKeepByRegexService(re: string) {
    this.filtersettings.filterServices = {
      state: 'keep',
      re,
    }
    return this;
  }

  public build() {
    return this.filtersettings;
  }
}
