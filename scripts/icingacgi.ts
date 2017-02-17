import {AbstractMonitor} from "./AbstractMonitor";
import {Monitor} from "./MonitorData";
import {UICommand} from "./UICommand";
import {Settings} from "./Settings";

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
    cgi_json_version: string
    status: {
        host_status: Array<IIcingaCgiHostStatusJson>,
        service_status: Array<IIcingaCgiServiceStatusJson>
    }
    service_status: Array<IIcingaCgiServiceStatusJson>
}

export class IcingaCgi extends AbstractMonitor {
    handleUICommand(param: UICommand): void {
    }

    fetchStatus(): Promise<Monitor.MonitorData> {
        console.log("fetchStatus");
        return new Promise<Monitor.MonitorData>(
            (resolve, reject) => {
                let requesturl = Settings.urlNoTrailingSlash(this.settings) + "/status.cgi?host=all&style=hostservicedetail&jsonoutput";
                console.log("Loading " + requesturl);
                if (this.settings.hostgroup) {
                    requesturl += "&hostgroup=" + this.settings.hostgroup;
                }

                let cgirequest = this.environment.load(requesturl, this.settings.username, this.settings.password);

                cgirequest
                    .then(a => {
                        resolve(this.processData(JSON.parse(a)));
                    })
                    .catch(a => {
                        resolve(Monitor.ErrorMonitorData(a));
                    })
            }
        );
    }


    private processData(response: IIcingaCgiJson): Monitor.MonitorData {
        let m = new Monitor.MonitorData();

        // Add host group to title
        if (this.settings.hostgroup) {
            m.hostgroupinfo = "(" + this.settings.hostgroup + ")";
        }

        var processed = false;

        // process different icinga versions
        if (response.cgi_json_version) {
            var version_parts = response.cgi_json_version.split(".");
            if (version_parts.length >= 2) {
                var major_version = parseInt(version_parts[0]);
                var minor_version = parseInt(version_parts[1]);
                if (major_version === 1) {
                    if (minor_version >= 8) {
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
                    "Icinga version not supported. Please open an issue on GitHub.",
                    "https://github.com/ErikWegner/imoin/issues");
                processed = true;
            }
        }

        return m;
    }

    private ProcessResponse_1_10(response : IIcingaCgiJson, status : Monitor.MonitorData) {
        var hso;

        function processHoststatus(hoststatus : IIcingaCgiHostStatusJson, settings: Settings) : Monitor.Host {
            hso = new Monitor.Host(hoststatus.host_display_name);
            hso.status = hoststatus.status;
            hso.checkresult = hoststatus.status_information;
            hso.has_been_acknowledged = hoststatus.has_been_acknowledged;
            hso.hostlink = Settings.urlNoTrailingSlash(settings) + "/extinfo.cgi?type=1&host=" + hoststatus.host_name;
            return hso;
        }

        function processServicestatus(servicestatus : IIcingaCgiServiceStatusJson, settings: Settings) {
            let hoststatus = status.getHostByName(servicestatus.host_name);
            let service = new Monitor.Service(servicestatus.service_description);
            hoststatus.addService(service);
            service.checkresult = servicestatus.status_information;
            service.status = servicestatus.status;
            service.servicelink = Settings.urlNoTrailingSlash(settings) +
                "/extinfo.cgi?type=2&host=" + servicestatus.host_name +
                "&service=" + servicestatus.service_description;
        }

        const settings = this.settings;
        if (response != null) {
            if (response.status) {
                if (response.status.host_status) {
                    response.status.host_status.forEach(h => status.addHost(processHoststatus(h, settings)), this);
                }

                if (response.status.service_status) {
                    response.status.service_status.forEach(s => processServicestatus(s, settings));
                    status.totalservices = response.status.service_status.length;
                }
            }
        }
    }
}
