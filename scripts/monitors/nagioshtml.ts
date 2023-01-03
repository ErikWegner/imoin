import { UICommand } from '../UICommand.js';
import { AbstractMonitor } from './AbstractMonitor.js';
import { ErrorMonitorData, Host, MonitorData, Service } from './MonitorData.js';

export class NagiosHtml extends AbstractMonitor {
  public fetchStatus(): Promise<MonitorData> {
    return new Promise<MonitorData>((resolve) => {
      const hosturl =
        this.settings.url +
        '/cgi-bin/status.cgi?hostgroup=all&style=hostdetail&limit=0';
      const servicesurl =
        this.settings.url +
        '/cgi-bin/status.cgi?hostgroup=all&style=detail&limit=0';

      const hostsrequest = this.environment.load(
        hosturl,
        this.settings.username,
        this.settings.password
      );
      const servicesrequest = this.environment.load(
        servicesurl,
        this.settings.username,
        this.settings.password
      );

      Promise.all([hostsrequest, servicesrequest])
        .then((a) => {
          const m = this.processData(a[0], a[1]);
          resolve(m);
        })
        .catch((a: string[]) => {
          resolve(
            ErrorMonitorData(
              `Connection error. Check settings and log. ${a[0]}|${a[1]}`
            )
          );
        });
    });
  }

  protected handleUICommand(_param: UICommand): void {
    throw new Error('Method not implemented.');
  }

  protected processData(hosthtml: string, servicehtml: string): MonitorData {
    // extract HOSTUP
    // extract HOSTDOWN
    const m = new MonitorData();
    const hostByName: { [name: string]: Host } = {};
    const index = this.index;
    const r1 =
      /extinfo.cgi.*?>(.*?)<\/a>[\s\S]*?>(UP|DOWN|PENDING|UNREACHABLE)[\s\S]*?valign='center'>(.*?)<\/td>/gi;
    let hostmatches: RegExpExecArray | null;
    while ((hostmatches = r1.exec(hosthtml)) !== null) {
      const host = new Host(hostmatches[1]);
      host.instanceindex = index;
      host.setState(hostmatches[2] === 'UP' ? 'UP' : 'DOWN');
      host.checkresult = this.decodeNumericEntities(
        hostmatches[3].replace('&nbsp;', ' ').trim()
      );
      hostByName[host.name] = host;
      m.addHost(host);
    }

    const r2 =
      /extinfo\.cgi.*?host=(.*?)&(amp;)?service=(.*?)['"]>(.*?)<\/a>[\s\S]*?>(CRITICAL|OK|WARNING|PENDING|UNKNOWN)<\/td>[\s\S]*?valign=['"]center['"]>(.*?)<\/td>/gi;
    let servicematches: RegExpExecArray | null;
    while ((servicematches = r2.exec(servicehtml)) != null) {
      const host = hostByName[servicematches[1]];
      if (!host) {
        continue;
      }

      const service = new Service(servicematches[4]);
      const status = servicematches[5];
      service.checkresult = this.decodeNumericEntities(
        servicematches[6].replace('&nbsp;', ' ').trim()
      );
      service.setState(
        status === 'OK' ? 'OK' : status === 'WARNING' ? 'WARNING' : 'CRITICAL'
      );

      host.addService(service);
    }

    return m;
  }

  /**
   * Replace numeric html entities with their characters,
   * e.g. &#34; ⇒ "
   * @param i Input string
   * @returns The decoded string
   */
  private decodeNumericEntities(i: string) {
    return i.replace(/&#(\d+);/g, (_m, charCode: number) => {
      return String.fromCharCode(charCode);
    });
  }
}
