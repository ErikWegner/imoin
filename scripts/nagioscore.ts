import { AbstractMonitor } from './AbstractMonitor';
import { Monitor } from './MonitorData';
import { UICommand } from './UICommand';

interface IHostJsonData {
  data: {
    hostlist: {[hostname: string]: {
      name: String
    }};
  }
}

interface IServiceJsonData {

}

export class NagiosCore extends AbstractMonitor {
  fetchStatus(): Promise<Monitor.MonitorData> {
    return new Promise<Monitor.MonitorData>(
      (resolve, reject) => {
        const hosturl = this.settings.url + "/cgi-bin/statusjson.cgi?query=hostlist&formatoptions=whitespace&details=true";
        const servicesurl = this.settings.url + "/cgi-bin/statusjson.cgi?query=servicelist&formatoptions=whitespace&details=true";

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
            resolve(Monitor.ErrorMonitorData("Connection error. Check settings and log. " + a[0] + "|" + a[1]));
        });
      });
  }
  handleUICommand(param: UICommand): void {
    throw new Error("Method not implemented.");
  }

  protected processData(hostdata: IHostJsonData, servicedata: IServiceJsonData): Monitor.MonitorData {
    if (hostdata == null || servicedata == null) {
      return Monitor.ErrorMonitorData("Result empty");
    }
  }
}
