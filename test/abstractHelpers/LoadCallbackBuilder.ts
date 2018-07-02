import { Monitor, IHostJsonData, IServiceJsonData, IcingaStateType } from '../../scripts/monitors';
import { IcingaOptionsVersion } from '../../scripts/Settings';
import { MonitorStatusBuilder } from './MonitorStatusBuilder';

export class LoadCallbackBuilder extends MonitorStatusBuilder {

  public BuildCallbacks(i: IcingaOptionsVersion): string[] {
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
