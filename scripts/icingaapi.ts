import { IEnvironment } from "./IEnvironment";
import { AbstractMonitor } from "./AbstractMonitor";
import { Monitor } from "./MonitorData";
import Status = Monitor.Status;
import { Settings } from "./Settings";

interface IHostJsonData {
    results: Array<{
        attrs: {
            display_name: string
            last_check_result: {
                state: number
                output: string
            }
        }
        name: string
    }>
}

interface IServiceJsonData {
    results: Array<{
        attrs: {
            display_name: string
            last_check_result: {
                /* (0 = OK, 1 = WARNING, 2 = CRITICAL, 3 = UNKNOWN). */
                state: number
                output: string
            }
        }
        name: string
    }>
}

export class IcingaApi extends AbstractMonitor {
    private environment: IEnvironment
    private settings: Settings

    fetchStatus(): Promise<Monitor.MonitorData> {
        return new Promise<Monitor.MonitorData>(
            (resolve, reject) => {
                var hosturl = this.settings.url + "/api/v1/objects/hosts?attrs=display_name&attrs=last_check_result"
                var servicesurl = this.settings.url + "/api/v1/objects/services?attrs=display_name&attrs=last_check_result"

                var hostsrequest = this.environment.load(hosturl)
                var servicesrequest = this.environment.load(servicesurl)

                Promise
                    .all([hostsrequest, servicesrequest])
                    .then(a => {
                        var hostdata = JSON.parse(a[0])
                        var servicedata = JSON.parse(a[1])
                        resolve(this.processData(hostdata, servicedata));
                    })
                    .catch(a => {
                        resolve(Monitor.ErrorMonitorData(a[0] + "|" + a[1]));
                    })
            }
        );
    }

    init(environment: IEnvironment, settings: Settings) {
        this.environment = environment
        this.settings = settings
    }

    startTimer() {
        var fetchfunc = this.fetchStatus
        this.environment.initTimer(
            this.settings.timerPeriod,
            function () {
                fetchfunc().then(
                    status => {
                        this.environment.displayStatus(status);
                    }
                )
            });
    }

    shutdown() {
        this.environment.stopTimer();
    }

    processData(hostdata: IHostJsonData, servicedata: IServiceJsonData): Monitor.MonitorData {
        if (
            hostdata == null 
            || hostdata.results == null
            || servicedata == null
            || servicedata.results == null
            ) {
            return Monitor.ErrorMonitorData("Result empty");
        }

        var m = new Monitor.MonitorData();
        var hostByName: { [name: string]: Monitor.Host } = {}
        hostdata.results.forEach(hostdatahost => {
            var host = new Monitor.Host(hostdatahost.name)
            hostByName[host.name] = host
            host.setState(hostdatahost.attrs.last_check_result.state == 0 ? Status.GREEN : Status.RED)
            m.addHost(host)
        });

        return m
    }
}