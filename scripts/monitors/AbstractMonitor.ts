import { IMonitor } from './IMonitor';
import { Monitor } from './MonitorData';
import { IEnvironment } from '../IEnvironment';
import { ImoinMonitorInstance } from '../Settings';
import { UICommand } from '../UICommand';

export abstract class AbstractMonitor implements IMonitor {

    public static filterStatus(status: Monitor.MonitorData): Monitor.MonitorData {
        let result = status;
        result = AbstractMonitor.filterOutAcknowledged(status);
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

    private static filterOutAcknowledged(status: Monitor.MonitorData): Monitor.MonitorData {
        const result = status;
        result.hosts = result.hosts.filter((host) => !host.hasBeenAcknowledged);
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
                        const status = AbstractMonitor.filterStatus(rawstatus);
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
