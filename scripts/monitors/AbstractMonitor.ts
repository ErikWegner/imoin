import { IEnvironment } from '../IEnvironment.js';
import { FilterSettings, ImoinMonitorInstance } from '../Settings.js';
import { UICommand } from '../UICommand.js';
import {
  FHost,
  filterAcknowledged,
  filterChecksDisabled,
  filterDowntime,
  filterNotificationDisabled,
  filterServicesOnAcknowledgedHosts,
  filterServicesOnDownHosts,
  filterSoftStates,
  filterUp,
} from './filters/index.js';
import { IMonitor } from './IMonitor.js';
import { MonitorData } from './MonitorData.js';

export abstract class AbstractMonitor implements IMonitor {
  /**
   * Apply all filter settings. Take the list of hosts and
   * their services and apply each filter. After each filter
   * stage, the list may be reduced. At the end, the list
   * only contains failures.
   * @param status The unfiltered instance status
   * @param filtersettings The filter settings
   */
  public static applyFilters(
    status: MonitorData,
    filtersettings?: FilterSettings
  ) {
    let result: FHost[] | null = status
      .getHosts()
      .map((host) => new FHost(host));
    /* filterOutUP */
    result = filterUp(result);
    /* filterOutAcknowledged */
    result = filterAcknowledged(result, filtersettings);
    /* filterOutDisabledNotifications */
    result = filterNotificationDisabled(result, filtersettings);
    /* filterOutDisabledCheck */
    result = filterChecksDisabled(result, filtersettings);
    /* filterOutSoftStates */
    result = filterSoftStates(result, filtersettings);
    /* filterOutDowntime */
    result = filterDowntime(result, filtersettings);
    /* filterOutServicesOnDownHosts */
    result = filterServicesOnDownHosts(result, filtersettings);
    /* filterOutServicesOnAcknowledgedHosts */
    result = filterServicesOnAcknowledgedHosts(result, filtersettings);
    // filterOutFlapping: boolean;
    // filterOutAllDown: boolean;
    // filterOutAllUnreachable: boolean;
    // filterOutAllUnknown: boolean;
    // filterOutAllWarning: boolean;
    // filterOutAllCritical: boolean;
    // filterHosts: RegExMatchSettings;
    // filterServices: RegExMatchSettings;
    // filterInformation: RegExMatchSettings;
    /* filterOutUP again */
    result = filterUp(result);
    // last step
    result?.forEach((fhost) => {
      const host = fhost.getHost();
      host.appearsInShortlist = true;
      fhost.getFServices().forEach((service) => {
        service.appearsInShortlist = true;
      });
    });
    return result;
  }

  constructor(
    protected environment: IEnvironment,
    protected settings: ImoinMonitorInstance,
    protected index: number
  ) {
    this.environment.onUICommand(index, this.handleUICommand.bind(this));
  }

  public startTimer() {
    this.environment.initTimer(this.index, this.settings.timerPeriod, () => {
      void this.fetchStatus().then((status: MonitorData) => {
        const filteredHosts = AbstractMonitor.applyFilters(
          status,
          this.settings.filtersettings
        );
        status.updateCounters(filteredHosts);
        status.instanceLabel = this.settings.instancelabel;
        this.environment.displayStatus(this.index, status);
      });
    });
  }

  public shutdown() {
    this.environment.stopTimer(this.index);
  }

  public abstract fetchStatus(): Promise<MonitorData>;

  protected abstract handleUICommand(param: UICommand): void;
}
