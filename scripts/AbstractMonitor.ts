import {IMonitor} from "./IMonitor";
import {Monitor} from "./MonitorData";
import {IEnvironment} from "./IEnvironment";
import {Settings} from "./Settings";

export abstract class AbstractMonitor implements IMonitor {
    protected environment: IEnvironment;
    protected settings: Settings;

    init(environment: IEnvironment, settings: Settings) {
        this.environment = environment;
        this.settings = settings;
    }

    startTimer() {
        var fetchfunc = this.fetchStatus.bind(this)
        var e = this.environment
        this.environment.initTimer(
            this.settings.timerPeriod,
            function () {
                fetchfunc().then(
                    (status: Monitor.MonitorData) => {
                        e.displayStatus(status);
                    }
                )
            });
    }

    shutdown() {
        this.environment.stopTimer();
    }

    abstract fetchStatus(): Promise<Monitor.MonitorData>;
}