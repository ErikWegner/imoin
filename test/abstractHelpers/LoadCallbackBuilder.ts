import { ServiceBuilder } from './ServiceBuilder';
import { Monitor, IHostJsonData, IServiceJsonData, IcingaStateType } from '../../scripts/monitors';
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

  public disableNotifications(): any {
    this.activeHost.notificationsDisabled = true;
    return this;
  }

  public softState() {
    this.activeHost.isInSoftState = true;
    return this;
  }

  public setup(f: (lcb: LoadCallbackBuilder) => void) {
    f(this);
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
    function addAttributes(host: Monitor.Host, hostobject: any) {
      if (host.hasBeenAcknowledged) {
        hostobject.attrs['acknowledgement'] = 1.0;
      }
      if (host.isInSoftState) {
        hostobject.attrs['state_type'] = IcingaStateType.SOFT;
      }
      if (host.notificationsDisabled) {
        hostobject.attrs['enable_notifications'] = false;
      }
    }

    const hostdata = (): IHostJsonData => {
      return {
        results: Object.keys(this.hosts).map((hostkey) => {
          const host: Monitor.Host = this.hosts[hostkey];
          /* Setup common response attributes */
          const hostobject: any = {
            attrs: {
              display_name: host.name,
              last_check_result: {
                state: host.getState() === 'UP' ? 0 : 1,
                output: ''
              },
            },
            name: host.name
          };
          addAttributes(host, hostobject);
          return hostobject;
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
              enable_notifications: !service.notificationsDisabled,
              last_check_result: {
                /* (0 = OK, 1 = WARNING, 2 = CRITICAL, 3 = UNKNOWN). */
                state: 0,
                output: ''
              },
              state_type: service.isInSoftState ? 0 : 1,
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
