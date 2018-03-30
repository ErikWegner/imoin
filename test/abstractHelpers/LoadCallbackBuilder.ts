import { ServiceBuilder } from './ServiceBuilder';
import { Monitor, IHostJsonData, IServiceJsonData } from '../../scripts/monitors';
import { ImoinMonitorInstance, IcingaOptionsVersion } from '../../scripts/Settings';

export class LoadCallbackBuilder {
  private hosts: { [name: string]: Monitor.Host } = {};
  private activeHost: Monitor.Host = null;

  public Host(name: string) {
    this.activeHost = this.hosts[name] = new Monitor.Host(name);
    return this;
  }

  public Down() {
    this.activeHost.setState('DOWN');
    return this;
  }

  public HasBeenAcknowledged() {
    this.activeHost.hasBeenAcknowledged = true;
    return this;
  }

  public Service(
    name: string,
    servicesetup: (b: ServiceBuilder) => void
  ) {
    const sb = ServiceBuilder
      .create(name);
    servicesetup(sb);
    sb.addToHost(this.activeHost);
    return this;
  }

  public GetHosts() {
    return Object.keys(this.hosts).map((key) => this.hosts[key]);
  }

  public Build(i: IcingaOptionsVersion): string[] {
    if (i === 'api1') {
      return this.buildIcingaApi();
    }

    throw new Error('Not implemented');
  }

  public buildIcingaApi() {
    const hostdata = (): IHostJsonData => {
      return {
        results: Object.keys(this.hosts).map((hostkey) => {
          const host: Monitor.Host = this.hosts[hostkey];
          return {
            attrs: {
              acknowledgement: host.hasBeenAcknowledged ? 1.0 : 0.0,
              display_name: host.name,
              last_check_result: {
                state: host.getState() === 'UP' ? 0 : 1,
                output: ''
              }
            },
            name: host.name
          };
        })
      };
    };

    const servicedata = (): IServiceJsonData => {
      const a: IServiceJsonData = {
        results: []
      };
      Object.keys(this.hosts).map((hostkey) => {
        const host: Monitor.Host = this.hosts[hostkey];
        host.services.forEach((service) => {
          a.results.push({
            attrs: {
              acknowledgement: service.hasBeenAcknowledged ? 1 : 0,
              display_name: service.name,
              last_check_result: {
                /* (0 = OK, 1 = WARNING, 2 = CRITICAL, 3 = UNKNOWN). */
                state: 0,
                output: ''
              },
            },
            name: host.name + '!' + service.name
          });
        });
      });
      return a;
    };

    return [JSON.stringify(hostdata()), JSON.stringify(servicedata())];
  }
}
