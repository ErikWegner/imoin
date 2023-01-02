import { ImoinMonitorInstance, Settings } from '../Settings';
import { UICommand } from '../UICommand';
import { AbstractMonitor } from './AbstractMonitor';
import {
  ErrorMonitorData,
  Host,
  HostState,
  MonitorData,
  Service,
  ServiceState,
} from './MonitorData';

interface IIcingaCgiHostStatusJson {
  host_name: string;
  host_display_name: string;
  status: HostState;
  status_information: string;
  has_been_acknowledged: boolean;
}

interface IIcingaCgiServiceStatusJson {
  host_name: string;
  service_description: string;
  status: ServiceState;
  status_information: string;
}

interface IIcingaCgiJson {
  cgi_json_version: string;
  status: {
    host_status: IIcingaCgiHostStatusJson[];
    service_status: IIcingaCgiServiceStatusJson[];
  };
  service_status: IIcingaCgiServiceStatusJson[];
}

export class IcingaCgi extends AbstractMonitor {
  public fetchStatus(): Promise<MonitorData> {
    return new Promise<MonitorData>((resolve) => {
      let requesturl =
        this.settings.url +
        '/status.cgi?host=all&style=hostservicedetail&jsonoutput';
      if (this.settings.hostgroup) {
        requesturl += '&hostgroup=' + this.settings.hostgroup;
      }

      const cgirequest = this.environment.load(
        requesturl,
        this.settings.username,
        this.settings.password
      );

      cgirequest
        .then((a) => resolve(this.processData(JSON.parse(a) as IIcingaCgiJson)))
        .catch((a: string) =>
          resolve(ErrorMonitorData(`Connection error. Check settings. ${a}`))
        );
    });
  }

  protected handleUICommand(_param: UICommand): void {
    // do nothing
  }

  private processData(response: IIcingaCgiJson): MonitorData {
    let m = new MonitorData();

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
        m = ErrorMonitorData(
          'Icinga version not supported. Please open an issue on GitHub.',
          'https://github.com/ErikWegner/imoin/issues'
        );
        processed = true;
      }
    }

    return m;
  }

  private ProcessResponse_1_10(response: IIcingaCgiJson, status: MonitorData) {
    const instanceindex = this.index;

    function processHoststatus(
      hoststatus: IIcingaCgiHostStatusJson,
      instance: ImoinMonitorInstance
    ): Host {
      const hso = new Host(hoststatus.host_display_name);
      hso.setState(hoststatus.status);
      hso.checkresult = hoststatus.status_information;
      hso.hasBeenAcknowledged = hoststatus.has_been_acknowledged;
      hso.hostlink =
        Settings.urlNoTrailingSlash(instance) +
        '/extinfo.cgi?type=1&host=' +
        hoststatus.host_name;
      hso.instanceindex = instanceindex;
      return hso;
    }

    function processServicestatus(
      servicestatus: IIcingaCgiServiceStatusJson,
      instance: ImoinMonitorInstance
    ) {
      const hoststatus = status.getHostByName(servicestatus.host_name);
      const service = new Service(servicestatus.service_description);
      hoststatus.addService(service);
      service.checkresult = servicestatus.status_information;
      service.setState(servicestatus.status);
      service.servicelink =
        Settings.urlNoTrailingSlash(instance) +
        '/extinfo.cgi?type=2&host=' +
        servicestatus.host_name +
        '&service=' +
        servicestatus.service_description;
    }

    const settings = this.settings;
    if (response != null) {
      if (response.status) {
        if (response.status.host_status) {
          response.status.host_status.forEach(
            (h) => status.addHost(processHoststatus(h, settings)),
            this
          );
        }

        if (response.status.service_status) {
          response.status.service_status.forEach((s) =>
            processServicestatus(s, settings)
          );
          status.totalservices = response.status.service_status.length;
        }
      }
    }
  }
}
