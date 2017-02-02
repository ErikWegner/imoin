import {IMonitor} from "./IMonitor";
import {Monitor} from "./MonitorData";

export abstract class AbstractMonitor implements IMonitor {

    abstract fetchStatus(): Promise<Monitor.MonitorData>
}