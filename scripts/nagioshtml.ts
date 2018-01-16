import { AbstractMonitor } from './AbstractMonitor';
import { Monitor } from './MonitorData';
import { UICommand } from './UICommand';

export class NagiosHtml extends AbstractMonitor {
  fetchStatus(): Promise<Monitor.MonitorData> {
    return new Promise<Monitor.MonitorData>(
      (resolve, reject) => {
        const hosturl = this.settings.url + '/cgi-bin/status.cgi?hostgroup=all&style=hostdetail&limit=0';
        const servicesurl = this.settings.url + '/cgi-bin/status.cgi?hostgroup=all&style=detail&limit=0';

        const hostsrequest = this.environment.load(hosturl, this.settings.username, this.settings.password);
        const servicesrequest = this.environment.load(servicesurl, this.settings.username, this.settings.password);

        Promise
          .all([hostsrequest, servicesrequest])
          .then(a => {
            const m = this.processData(a[0], a[1]);
            resolve(m);
          })
          .catch(a => {
            resolve(Monitor.ErrorMonitorData('Connection error. Check settings and log. ' + a[0] + '|' + a[1]));
          });
      }
    )
  }
  handleUICommand(param: UICommand): void {
    throw new Error("Method not implemented.");
  }

  protected processData(hosthtml: string, servicehtml: string): Monitor.MonitorData {
    // extract HOSTUP
    // extract HOSTDOWN
    const m = new Monitor.MonitorData();
    const hostByName: { [name: string]: Monitor.Host } = {};
    const index = this.index;
    const r1 = /extinfo.cgi.*?>(.*?)<\/a>[\s\S]*?>(UP|DOWN|PENDING|UNREACHABLE)[\s\S]*?valign='center'>(.*?)<\/td>/gi;
    let hostmatches;
    while (hostmatches = r1.exec(hosthtml)) {
      const host = new Monitor.Host(hostmatches[1]);
      host.instanceindex = index;
      host.setState(hostmatches[2] === 'UP' ? 'UP' : 'DOWN');
      host.checkresult = hostmatches[3].replace('&nbsp;', ' ').trim();
      hostByName[host.name] = host;
      m.addHost(host);
    }

    const r2 = /extinfo\.cgi.*?host=(.*?)&(amp;)?service=(.*?)['"]>(.*?)<\/a>[\s\S]*?>(CRITICAL|OK|WARNING|PENDING|UNKNOWN)<\/td>[\s\S]*?valign=['"]center['"]>(.*?)<\/td>/gi;
    let servicematches;
    while (servicematches = r2.exec(servicehtml)) {
      const host = hostByName[servicematches[1]];
      if (!host) {
        continue;
      }

      const service = new Monitor.Service(servicematches[4]);
      const status = servicematches[5];
      service.checkresult = servicematches[6].replace('&nbsp;', ' ').trim();
      service.setStatus(status === 'OK' ? 'OK' : status === 'WARNING' ? 'WARNING' : 'CRITICAL')

      host.addService(service);
    }

    return m;
  }
}
