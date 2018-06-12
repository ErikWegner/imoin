import { IEnvironment } from '../IEnvironment';
import { Monitor } from './MonitorData';
import { AbstractMonitor } from './AbstractMonitor';
import Status = Monitor.Status;
import { Settings } from '../Settings';
import { UICommand } from '../UICommand';

enum IcingaStateType {
    SOFT = 0,
    HARD = 1
  }

export interface IHostJsonData {
    results: Array<{
        attrs: {
            acknowledgement?: number
            display_name: string
            last_check_result: {
                state: number
                output: string
            },
            state_type?: IcingaStateType,
        }
        name: string
    }>;
}

export interface IServiceJsonData {
    results: Array<{
        attrs: {
            acknowledgement?: number
            display_name: string
            last_check_result: {
                /* (0 = OK, 1 = WARNING, 2 = CRITICAL, 3 = UNKNOWN). */
                state: number
                output: string
            },
            state_type?: IcingaStateType,
        }
        name: string
    }>;
}

export class IcingaApi extends AbstractMonitor {
    public static processData(
        hostdata: IHostJsonData,
        servicedata: IServiceJsonData,
        index: number
    ): Monitor.MonitorData {
        if (
            hostdata == null
            || hostdata.results == null
            || servicedata == null
            || servicedata.results == null
        ) {
            return Monitor.ErrorMonitorData('Result empty');
        }

        const m = new Monitor.MonitorData();
        const hostByName: { [name: string]: Monitor.Host } = {};

        hostdata.results.forEach((hostdatahost) => {
            const host = new Monitor.Host(hostdatahost.name);
            host.instanceindex = index;
            hostByName[host.name] = host;
            host.setState(hostdatahost.attrs.last_check_result.state === 0 ? 'UP' : 'DOWN');
            host.isInSoftState = hostdatahost.attrs.state_type === 0;
            host.checkresult = hostdatahost.attrs.last_check_result.output;
            if (hostdatahost.attrs.acknowledgement > 0) {
                host.hasBeenAcknowledged = true;
            }
            m.addHost(host);
        });

        servicedata.results.forEach((jsonservice) => {
            const host = hostByName[jsonservice.name.substr(0, jsonservice.name.indexOf('!'))];
            if (host) {
                const service = new Monitor.Service(jsonservice.attrs.display_name);
                if (jsonservice.attrs.last_check_result) {
                    // tslint:disable-next-line:max-line-length
                    // taken from https://github.com/Icinga/icinga2/blob/master/lib/icinga/checkresult.ti#L42
                    if (jsonservice.attrs.last_check_result.state === 0) {
                        service.setState('OK');
                    } else if (jsonservice.attrs.last_check_result.state === 1) {
                        service.setState('WARNING');
                    } else if (jsonservice.attrs.last_check_result.state === 3) {
                        service.setState('UNKNOWN');
                    }
                    service.checkresult = jsonservice.attrs.last_check_result.output;
                } else {
                    service.checkresult = 'Check did not run yet.';
                }
                service.host = host.name;
                if (jsonservice.attrs.acknowledgement > 0) {
                    service.hasBeenAcknowledged = true;
                }
                service.isInSoftState = jsonservice.attrs.state_type === 0;
                host.addService(service);
            }
        });

        return m;
    }

    public fetchStatus(): Promise<Monitor.MonitorData> {
        return new Promise<Monitor.MonitorData>(
            (resolve, reject) => {
                const hosturl = this.settings.url +
                    '/v1/objects/hosts?' + this.hostAttrs();
                const servicesurl = this.settings.url +
                    '/v1/objects/services?' + this.serviceAttrs();

                const hostsrequest = this.environment.load(
                    hosturl, this.settings.username, this.settings.password);
                const servicesrequest = this.environment.load(
                    servicesurl, this.settings.username, this.settings.password);

                Promise
                    .all([hostsrequest, servicesrequest])
                    .then((a) => {
                        const hostdata = JSON.parse(a[0]);
                        const servicedata = JSON.parse(a[1]);
                        const m = IcingaApi.processData(hostdata, servicedata, this.index);
                        resolve(m);
                    })
                    .catch((a) => {
                        let msg = 'Connection error: ';
                        if (typeof a === 'string' && a !== '') {
                            msg += a;
                        } else {
                            msg += 'Check settings and log.';
                        }
                        resolve(Monitor.ErrorMonitorData(msg));
                    });
            }
        );
    }

    protected hostAttrs() {
        const attrs = ['display_name', 'last_check_result', 'acknowledgement'];
        if (this.settings.filtersettings) {
            const f = this.settings.filtersettings;
            if (f.filterOutSoftStates) {
                attrs.push('state_type');
            }
        }

        return attrs.map((attr) => 'attrs=' + attr).join('&');
    }

    protected serviceAttrs() {
        const attrs = ['display_name', 'last_check_result', 'acknowledgement'];
        if (this.settings.filtersettings) {
            const f = this.settings.filtersettings;
            if (f.filterOutSoftStates) {
                attrs.push('state_type');
            }
        }

        return attrs.map((attr) => 'attrs=' + attr).join('&');
    }

    protected handleUICommand(param: UICommand): void {
        if (param.command === 'recheck') {
            const url = this.settings.url + '/v1/actions/reschedule-check';
            const data = {
                type: 'Host',
                force_check: true,
                filter: 'host.name==\"' + param.hostname + '\"'
            };
            if (param.servicename) {
                data.type = 'Service';
                data.filter = 'service.name==\"' + param.servicename + '\"';
            }

            this.environment.post(url, data, this.settings.username, this.settings.password);
        }
    }
}
