import { IMonitor } from "./IMonitor";
import { Monitor } from "./MonitorData";
import { IEnvironment } from "./IEnvironment";
import { ImoinMonitorInstance } from "./Settings";
import { UICommand } from "./UICommand";

export abstract class AbstractMonitor implements IMonitor {
    protected environment: IEnvironment;
    protected settings: ImoinMonitorInstance;
    protected index: number;

    init(environment: IEnvironment, settings: ImoinMonitorInstance, index: number) {
        this.environment = environment;
        this.settings = settings;
        this.index = index;

        this.environment.onUICommand(index, this.handleUICommand.bind(this));
    }

    startTimer() {
        const fetchfunc = this.fetchStatus.bind(this);
        const e = this.environment;
        const index = this.index;
        const instanceLabel = this.settings.instancelabel;

        e.initTimer(
            index,
            this.settings.timerPeriod,
            function () {
                fetchfunc().then(
                    (status: Monitor.MonitorData) => {
                        status.updateCounters();
                        status.instanceLabel = instanceLabel;
                        e.displayStatus(index, status);
                    }
                )
            });
    }

    shutdown() {
        this.environment.stopTimer(this.index);
    }

    abstract fetchStatus(): Promise<Monitor.MonitorData>;

    abstract handleUICommand(param: UICommand): void;
}
