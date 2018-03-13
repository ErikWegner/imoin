import { IMonitor } from './IMonitor';
import { Monitor } from './MonitorData';
import { IEnvironment } from '../IEnvironment';
import { ImoinMonitorInstance, FilterSettings, RegExMatchSettings } from '../Settings';
import { UICommand } from '../UICommand';

export abstract class AbstractMonitor implements IMonitor {

    public static setPanelVisibilities(
        status: Monitor.MonitorData,
        filtersettings?: FilterSettings,
    ): Monitor.MonitorData {
        let result = status;
        result = AbstractMonitor.filterOutAcknowledged(
            status, AbstractMonitor.optionalFiltersettings(
            filtersettings, 'filterOutAcknowledged'));
        // filterOutDisabledNotifications: boolean;
        // filterOutDisabledChecks: boolean;
        // filterOutSoftStates: boolean;
        // filterOutDowntime: boolean;
        // filterOutServicesOnDownHosts: boolean;
        // filterOutServicesOnAcknowledgedHosts: boolean;
        // filterOutFlapping: boolean;
        // filterOutAllDown: boolean;
        // filterOutAllUnreachable: boolean;
        // filterOutAllUnknown: boolean;
        // filterOutAllWarning: boolean;
        // filterOutAllCritical: boolean;
        // filterHosts: RegExMatchSettings;
        // filterServices: RegExMatchSettings;
        // filterInformation: RegExMatchSettings;
        return result;
    }

    private static optionalFiltersettings(
        filtersettings: FilterSettings,
        p: keyof FilterSettings): boolean {
        if (filtersettings) {
            return filtersettings[p] as boolean;
        }

        return false;
    }

    private static filterOutAcknowledged(
        status: Monitor.MonitorData,
        filterOutAcknowledged: boolean,
    ): Monitor.MonitorData {
        const result = status;
        result.hosts.forEach((host) => {
            if (host.getState() === 'UP') {
                return;
            }
            /*
            filterOut   Host.Ack    Result
                T          T          F
                T          F          T
                F          T          T
                F          F          T
            */
            if (!(filterOutAcknowledged && host.hasBeenAcknowledged)) {
                host.appearsInShortlist = true;
            }
        });
        return result;
    }

    protected environment: IEnvironment;
    protected settings: ImoinMonitorInstance;
    protected index: number;

    public init(environment: IEnvironment, settings: ImoinMonitorInstance, index: number) {
        this.environment = environment;
        this.settings = settings;
        this.index = index;

        this.environment.onUICommand(index, this.handleUICommand.bind(this));
    }

    public startTimer() {
        this.environment.initTimer(
            this.index,
            this.settings.timerPeriod,
            () => {
                this.fetchStatus().then(
                    (rawstatus: Monitor.MonitorData) => {
                        const status = AbstractMonitor.setPanelVisibilities(
                            rawstatus, this.settings.filtersettings);
                        status.updateCounters();
                        status.instanceLabel = this.settings.instancelabel;
                        this.environment.displayStatus(this.index, status);
                    }
                );
            });
    }

    public shutdown() {
        this.environment.stopTimer(this.index);
    }

    public abstract fetchStatus(): Promise<Monitor.MonitorData>;

    protected abstract handleUICommand(param: UICommand): void;
}
