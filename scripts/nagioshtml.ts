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
    const r1 = new RegExp('<td align.*status(HOSTUP|HOSTDOWN|PENDING).*extinfo.cgi.*?>(.*)<\/a>', 'gi');
    let hostmatches;
    while (hostmatches = r1.exec(hosthtml)) {
      const host = new Monitor.Host(hostmatches[2]);
      host.instanceindex = index;
      host.setState(hostmatches[1] == 'HOSTUP' ? 'UP' : 'DOWN');
      const i1 = hosthtml.indexOf('</table>', hostmatches.index);
      const i2 = hosthtml.indexOf('</table>', i1 + 1);
      const i3 = hosthtml.indexOf('</table>', i2 + 1);
      const i4 = hosthtml.indexOf("valign='center'>", i3 + 1);
      const il = hosthtml.indexOf('</td>', i4);
      host.checkresult = hosthtml.substring(i4 + 16, il).replace('&nbsp;', ' ').trim();
      hostByName[host.name] = host;
      m.addHost(host);
    }
    
    return m;
  }
}
