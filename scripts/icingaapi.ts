import {AbstractMonitor} from "./AbstractMonitor";
import {Monitor} from "./MonitorData";
import Status = Monitor.Status;

export class IcingaApi extends AbstractMonitor {

    fetchStatus(): Promise<Monitor.MonitorData> {
        return new Promise<Monitor.MonitorData>(
            (resolve, reject) => {
                    resolve(new Monitor.MonitorData(Status.RED));
            }
        );
    }
}