import { Monitor } from './MonitorData';
import { AbstractMonitor } from './AbstractMonitor';
import { UICommand } from '../UICommand';
import { FilterSettings } from '../Settings';

export enum IcingaStateType {
    SOFT = 0,
    HARD = 1
}

export interface IIcinga2HostJsonData {
    results: Array<{
        attrs: {
            acknowledgement?: number
            display_name: string
            downtime_depth?: number
            enable_notifications?: boolean
            last_check_result: {
                state: number
                output: string
            },
            state_type?: IcingaStateType,
            enable_active_checks?: boolean,
        }
        name: string
    }>;
}

export interface IIcinga2ServiceJsonData {
    results: Array<{
        attrs: {
            acknowledgement?: number
            display_name: string
            downtime_depth?: number
            enable_notifications?: boolean
            last_check_result: {
                /* (0 = OK, 1 = WARNING, 2 = CRITICAL, 3 = UNKNOWN). */
                state: number
                output: string
            },
            state_type?: IcingaStateType,
            enable_active_checks?: boolean,
        }
        name: string
    }>;
}

export class IcingaApi extends AbstractMonitor {
    public static processData(
        hostdata: IIcinga2HostJsonData,
        servicedata: IIcinga2ServiceJsonData,
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
            if ((hostdatahost.attrs.acknowledgement ?? 0) > 0) {
                host.hasBeenAcknowledged = true;
            }
            host.notificationsDisabled =
                typeof hostdatahost.attrs.enable_notifications === 'undefined'
                    ? false
                    : !hostdatahost.attrs.enable_notifications;
            host.checksDisabled =
                typeof hostdatahost.attrs.enable_active_checks === 'undefined'
                    ? false
                    : !hostdatahost.attrs.enable_active_checks;
            host.isInDowntime =
                typeof hostdatahost.attrs.downtime_depth === 'undefined'
                    ? false
                    : hostdatahost.attrs.downtime_depth > 0;
            m.addHost(host);
        });

        servicedata.results.forEach((jsonservice) => {
            const host = hostByName[jsonservice.name.substr(0, jsonservice.name.indexOf('!'))];
            if (host) {
                const service = new Monitor.Service(jsonservice.attrs.display_name);
                if (jsonservice.attrs.last_check_result) {
                    if (jsonservice.attrs.last_check_result.state === 0) {
                        service.setState('OK');
                    } else if (jsonservice.attrs.last_check_result.state === 1) {
                        service.setState('WARNING');
                    }
                    service.checkresult = jsonservice.attrs.last_check_result.output;
                } else {
                    service.checkresult = 'Check did not run yet.';
                }
                service.host = host.name;
                if ((jsonservice.attrs.acknowledgement ?? 0) > 0) {
                    service.hasBeenAcknowledged = true;
                }
                service.isInSoftState = jsonservice.attrs.state_type === 0;
                service.notificationsDisabled =
                    typeof jsonservice.attrs.enable_notifications === 'undefined'
                        ? false
                        : !jsonservice.attrs.enable_notifications;
                service.checksDisabled =
                    typeof jsonservice.attrs.enable_active_checks === 'undefined'
                        ? false
                        : !jsonservice.attrs.enable_active_checks;
                service.isInDowntime =
                    typeof jsonservice.attrs.downtime_depth === 'undefined'
                        ? false
                        : jsonservice.attrs.downtime_depth > 0;
                host.addService(service);
            }
        });

        return m;
    }

    public fetchStatus(): Promise<Monitor.MonitorData> {
        return new Promise<Monitor.MonitorData>(
            (resolve) => {
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
        const attrs = ['display_name', 'last_check_result'];
        if (this.settings.filtersettings) {
            const f = this.settings.filtersettings;

            const queryParamToFilterSetting: { [key: string]: keyof FilterSettings } = {
                acknowledgement: 'filterOutAcknowledged',
                state_type: 'filterOutSoftStates',
                enable_notifications: 'filterOutDisabledNotifications',
                enable_active_checks: 'filterOutDisabledChecks',
                downtime_depth: 'filterOutDowntime',
            };

            Object
                .keys(queryParamToFilterSetting)
                .forEach((queryparam) => {
                    const filterSettingsKey = queryParamToFilterSetting[queryparam];
                    if (f[filterSettingsKey]) {
                        attrs.push(queryparam);
                    }
                });
        }

        return attrs.map((attr) => 'attrs=' + attr).join('&');
    }

    protected serviceAttrs() {
        return this.hostAttrs();
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
