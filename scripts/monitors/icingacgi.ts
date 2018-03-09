import { Monitor } from './MonitorData';
import { AbstractMonitor } from './AbstractMonitor';
import { UICommand } from '../UICommand';
import { Settings, ImoinMonitorInstance } from '../Settings';

interface IIcingaCgiHostStatusJson {
    host_name: string;
    host_display_name: string;
    status: Monitor.HostState;
    status_information: string;
    has_been_acknowledged: boolean;
}

interface IIcingaCgiServiceStatusJson {
    host_name: string;
    service_description: string;
    status: Monitor.ServiceState;
    status_information: string;
}

interface IIcingaCgiJson {
    cgi_json_version: string;
    status: {
        host_status: IIcingaCgiHostStatusJson[],
        service_status: IIcingaCgiServiceStatusJson[]
    };
    service_status: IIcingaCgiServiceStatusJson[];
}

export class IcingaCgi extends AbstractMonitor {
    public fetchStatus(): Promise<Monitor.MonitorData> {
        return new Promise<Monitor.MonitorData>(
            (resolve, reject) => {
                let requesturl = this.settings.url +
                    '/status.cgi?host=all&style=hostservicedetail&jsonoutput';
                if (this.settings.hostgroup) {
                    requesturl += '&hostgroup=' + this.settings.hostgroup;
                }

                const cgirequest = this.environment.load(
                    requesturl, this.settings.username, this.settings.password);

                cgirequest
                    .then((a) => resolve(this.processData(JSON.parse(a))))
                    .catch((a) => resolve(
                        Monitor.ErrorMonitorData('Connection error. Check settings. ' + a)));
            }
        );
    }

    protected handleUICommand(param: UICommand): void {
        // do nothing
    }

    private processData(response: IIcingaCgiJson): Monitor.MonitorData {
        let m = new Monitor.MonitorData();

        // Add host group to title
        if (this.settings.hostgroup) {
            m.hostgroupinfo = '(' + this.settings.hostgroup + ')';
        }

        let processed = false;

        // process different icinga versions
        if (response.cgi_json_version) {
            const versionParts = response.cgi_json_version.split('.');
            if (versionParts.length >= 2) {
                const majorVersion = parseInt(versionParts[0], 10);
                const minorVersion = parseInt(versionParts[1], 10);
                if (majorVersion === 1) {
                    if (minorVersion >= 8) {
                        this.ProcessResponse_1_10(response, m);
                        processed = true;
                    }
                }
            }
        }

        // guess a scheme
        if (processed === false) {
            if (response.service_status) {
                this.ProcessResponse_1_10(response, m);
                processed = true;
            } else {
                m = Monitor.ErrorMonitorData(
                    'Icinga version not supported. Please open an issue on GitHub.',
                    'https://github.com/ErikWegner/imoin/issues');
                processed = true;
            }
        }

        return m;
    }

    private ProcessResponse_1_10(response: IIcingaCgiJson, status: Monitor.MonitorData) {
        const instanceindex = this.index;

        function processHoststatus(
            hoststatus: IIcingaCgiHostStatusJson,
            instance: ImoinMonitorInstance
        ): Monitor.Host {
            const hso = new Monitor.Host(hoststatus.host_display_name);
            hso.status = hoststatus.status;
            hso.checkresult = hoststatus.status_information;
            hso.hasBeenAcknowledged = hoststatus.has_been_acknowledged;
            hso.hostlink = Settings.urlNoTrailingSlash(instance) +
                '/extinfo.cgi?type=1&host=' + hoststatus.host_name;
            hso.instanceindex = instanceindex;
            return hso;
        }

        function processServicestatus(
            servicestatus: IIcingaCgiServiceStatusJson,
            instance: ImoinMonitorInstance
        ) {
            const hoststatus = status.getHostByName(servicestatus.host_name);
            const service = new Monitor.Service(servicestatus.service_description);
            hoststatus.addService(service);
            service.checkresult = servicestatus.status_information;
            service.status = servicestatus.status;
            service.servicelink = Settings.urlNoTrailingSlash(instance) +
                '/extinfo.cgi?type=2&host=' + servicestatus.host_name +
                '&service=' + servicestatus.service_description;
        }

        const settings = this.settings;
        if (response != null) {
            if (response.status) {
                if (response.status.host_status) {
                    response.status.host_status.forEach(
                        (h) => status.addHost(processHoststatus(h, settings)), this);
                }

                if (response.status.service_status) {
                    response.status.service_status.forEach(
                        (s) => processServicestatus(s, settings));
                    status.totalservices = response.status.service_status.length;
                }
            }
        }
    }
}
