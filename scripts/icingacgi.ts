import {AbstractMonitor} from "./AbstractMonitor";
import {Monitor} from "./MonitorData";

interface IIcingaCgiHostStatusJson {

}
interface IIcingaCgiServiceStatusJson {

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
    fetchStatus(): Promise<Monitor.MonitorData> {
        console.log("fetchStatus");
        return new Promise<Monitor.MonitorData>(
            (resolve, reject) => {
                let requesturl = this.settings.url + "/status.cgi?host=all&style=hostservicedetail&jsonoutput";
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
                    } else if (minor_version === 6) {
                        this.ProcessResponse_1_6(response, m);
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
                this.ProcessResponse_1_6(response, m);
                processed = true;
            }
        }

        return m;
    }

    private ProcessResponse_1_6(response: IIcingaCgiJson, status: Monitor.MonitorData) {
        var servicestatus, hso, lasthostname = "";
        if (response != null) {
            if (response.status) {
                if (response.status.host_status) {
                    for (var index in response.status.host_status) {
                        servicestatus = response.status.host_status[index];

                        if (lasthostname !== servicestatus.host) {
                            hso = this.Hoststatus_Fill_1_6(servicestatus);
                            lasthostname = servicestatus.host;
                            status.details[hso.hostname] = hso;
                            if (hso.status !== "UP") {
                                status.hosterrors++;
                            } else {
                                status.hostup++;
                            }
                            status.totalhosts++;
                        }
                    }
                }
            }
        }
    }

    private ProcessResponse_1_10(response, status) {
        var hso;

        function processHoststatus(hoststatus) {
            hso = Hoststatus();
            Hoststatus_Fill_1_10(hso, hoststatus);
            status.details[hso.hostname] = hso;
            if (hso.status !== "UP") {
                status.hosterrors++;
            } else {
                status.hostup++;
            }
        }

        function processServicestatus(servicestatus) {
            var hoststatus = status.details[servicestatus.host_name];
            Hoststatus_AddService_1_10(hoststatus, servicestatus);
            if (servicestatus.status !== "OK") {
                if (servicestatus.status === "WARNING") {
                    status.servicewarnings++;
                } else {
                    status.serviceerrors++;
                }
            } else {
                status.serviceok++;
            }
        }

        if (response != null) {
            if (response.status) {
                if (response.status.host_status) {
                    response.status.host_status.forEach(processHoststatus);
                    status.totalhosts = response.status.host_status.length;
                }

                if (response.status.service_status) {
                    response.status.service_status.forEach(processServicestatus);
                    status.totalservices = response.status.service_status.length;
                }
            }
        }
    }

    private Hoststatus_Fill_1_6(icingahoststatus): Monitor.Host {
        let h = new Monitor.Host(icingahoststatus.host_display_name)
        // copy attributes from icinga
        target.hostname = icingahoststatus.host_display_name;
        target.status = icingahoststatus.status;
        target.information = icingahoststatus.status_information;
        target.acknowledged = icingahoststatus.has_been_acknowledged;
        target.hostlink = cgipath + "extinfo.cgi?type=1&host=" + icingahoststatus.host_name;
    }

    private Hoststatus_Fill_1_10(target, icingahoststatus) {
        // copy attributes from icinga
        target.hostname = icingahoststatus.host_display_name;
        target.status = icingahoststatus.status;
        target.information = icingahoststatus.status_information;
        target.acknowledged = icingahoststatus.has_been_acknowledged;
        target.hostlink = cgipath + "extinfo.cgi?type=1&host=" + icingahoststatus.host_name;
    }

    private Hoststatus_AddService_1_10(target, icingaservicestatus) {
        icingaservicestatus.servicelink = cgipath + "extinfo.cgi?type=2&host=" + icingaservicestatus.host_name + "&service=" + icingaservicestatus.service_description;
        target.services.push(icingaservicestatus);
    }

}


var TriggerCmdExec = function (data) {
    var cmds = {'ack': 33, 'recheck': 96};
    var url = cgipath;
    url += "cmd.cgi";
    var service_query = '';
    var cmdType = "host";
    var cmdFor = data.hostname;

    if (data.servicename !== "") {
        cmds = {'ack': 34, 'recheck': 7};
        data.servicename = data.servicename.replace(/ /, "+");
        service_query = '&service=' + data.servicename;
        cmdType = "hostservice";
        cmdFor += "^" + data.servicename;
    }

    if (data.command === "ack") {
        emit(target, EventNames.OpenTab, (url + '?cmd_typ=' + cmds[data.command] + '&host=' + data.hostname + service_query));
    }

    if (data.command === "recheck") {
        emit(target, EventNames.OpenTab, (url + '?cmd_typ=' + cmds[data.command] + '&host=' + data.hostname + service_query + '&force_check'));
    }
}
