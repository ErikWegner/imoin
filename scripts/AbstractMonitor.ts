import {IMonitor} from "./IMonitor";
import {Monitor} from "./MonitorData";
import {IEnvironment} from "./IEnvironment";
import {Settings} from "./Settings";

export abstract class AbstractMonitor implements IMonitor {
    abstract init(environment: IEnvironment, settings: Settings): void
    abstract startTimer(): void
}