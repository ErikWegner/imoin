import { AbstractMonitor } from './AbstractMonitor';
import { Monitor } from './MonitorData';
import { UICommand } from './UICommand';

interface IHostJsonData {
  data: {
    hostlist: {
      [hostname: string]: {
        name: string,
        status: number,
        plugin_output: string
      }
    };
  }
}

interface IServiceJsonData {
  data: {
    servicelist: {
      [hostname: string]: {
        [servicename: string]: {
          host_name: string,
          description: string,
          status: number,
          last_check: number,
          plugin_output: string
        }
      }
    }
  }

}

export class NagiosCore extends AbstractMonitor {
  fetchStatus(): Promise<Monitor.MonitorData> {
    return new Promise<Monitor.MonitorData>(
      (resolve, reject) => {
        const hosturl = this.settings.url + '/cgi-bin/statusjson.cgi?query=hostlist&formatoptions=whitespace&details=true';
        const servicesurl = this.settings.url + '/cgi-bin/statusjson.cgi?query=servicelist&formatoptions=whitespace&details=true';

        const hostsrequest = this.environment.load(hosturl, this.settings.username, this.settings.password);
        const servicesrequest = this.environment.load(servicesurl, this.settings.username, this.settings.password);

        Promise
          .all([hostsrequest, servicesrequest])
          .then(a => {
            const hostdata = JSON.parse(a[0]);
            const servicedata = JSON.parse(a[1]);
            const m = this.processData(hostdata, servicedata);
            resolve(m);
          })
          .catch(a => {
            resolve(Monitor.ErrorMonitorData('Connection error. Check settings and log. ' + a[0] + '|' + a[1]));
          });
      });
  }
  handleUICommand(param: UICommand): void {
    throw new Error('Method not implemented.');
  }

  protected processData(hostdata: IHostJsonData, servicedata: IServiceJsonData): Monitor.MonitorData {
    if (hostdata == null || servicedata == null) {
      return Monitor.ErrorMonitorData('Result empty');
    }
    const m = new Monitor.MonitorData();
    let hostByName: { [name: string]: Monitor.Host } = {};
    Object.keys(hostdata.data.hostlist).forEach((hostname) => {
      const hostdatahost = hostdata.data.hostlist[hostname];
      const host = new Monitor.Host(hostdatahost.name);
      hostByName[host.name] = host;
      host.setState(hostdatahost.status == 2 ? 'UP' : 'DOWN');
      host.checkresult = hostdatahost.plugin_output;
      m.addHost(host);
    });

    Object.keys(servicedata.data.servicelist).forEach((hostname) => {
      const hostwithservices = servicedata.data.servicelist[hostname];
      Object.keys(hostwithservices).forEach((servicename) => {
        const servicedataservice = hostwithservices[servicename];
        const host = hostByName[servicedataservice.host_name];
        if (host) {
          const service = new Monitor.Service(servicedataservice.description);
          if (servicedataservice.last_check !== 0) {
            if (servicedataservice.status === 2) {
              service.setStatus('OK');
            } else if (servicedataservice.status === 4) {
              service.setStatus('WARNING');
            }
            service.checkresult = servicedataservice.plugin_output;
          } else {
            service.checkresult = 'Check did not run yet.';
          }
          service.host = host.name;
          host.addService(service);
        }
      });
    });

    return m;
  }
}
