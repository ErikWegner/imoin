import { IEnvironment } from "./IEnvironment";
import { AbstractMonitor } from "./AbstractMonitor";
import { Monitor } from "./MonitorData";
import Status = Monitor.Status;
import { Settings } from "./Settings";

export interface IHostJsonData {
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

export interface IServiceJsonData {
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
    private environment: IEnvironment;
    private settings: Settings;

    fetchStatus(): Promise<Monitor.MonitorData> {
        console.log("fetchStatus");
        return new Promise<Monitor.MonitorData>(
            (resolve, reject) => {
                let hosturl = this.settings.url + "/api/v1/objects/hosts?attrs=display_name&attrs=last_check_result";
                let servicesurl = this.settings.url + "/api/v1/objects/services?attrs=display_name&attrs=last_check_result";

                let hostsrequest = this.environment.load(hosturl, this.settings.username, this.settings.password);
                let servicesrequest = this.environment.load(servicesurl, this.settings.username, this.settings.password);

                Promise
                    .all([hostsrequest, servicesrequest])
                    .then(a => {
                        let hostdata = JSON.parse(a[0]);
                        let servicedata = JSON.parse(a[1]);
                        resolve(this.processData(hostdata, servicedata));
                    })
                    .catch(a => {
                        resolve(Monitor.ErrorMonitorData(a[0] + "|" + a[1]));
                    })
            }
        );
    }

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
                    (status : Monitor.MonitorData) => {
                        e.displayStatus(status);
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

        let m = new Monitor.MonitorData();
        let hostByName: {[name: string]: Monitor.Host} = {};
        hostdata.results.forEach(hostdatahost => {
            let host = new Monitor.Host(hostdatahost.name);
            hostByName[host.name] = host;
            host.setState(hostdatahost.attrs.last_check_result.state == 0 ? "UP" : "DOWN");
            host.checkresult = hostdatahost.attrs.last_check_result.output;
            m.addHost(host);
        });

        servicedata.results.forEach(jsonservice => {
            let host = hostByName[jsonservice.name.substr(0, jsonservice.name.indexOf("!"))];
            if (host) {
                let service = new Monitor.Service(jsonservice.attrs.display_name);
                if (jsonservice.attrs.last_check_result.state == 0) {
                    service.setStatus("OK");
                } else if (jsonservice.attrs.last_check_result.state == 1) {
                    service.setStatus("WARNING");
                }
                service.host = host.name;
                service.checkresult = jsonservice.attrs.last_check_result.output;
                host.addService(service);
            }
        });

        m.updateCounters();

        return m
    }
}