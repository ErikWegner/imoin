import { Monitor, IcingaStateType } from '../../scripts/monitors';
import {
  IIcinga2HostJsonData as IcingaHostJsonData,
  IIcinga2ServiceJsonData as IcingaServiceJsonData
} from '../../scripts/monitors/icingaapi';
import {
  INagiosCoreHostJsonData as NagiosCoreHostJsonData,
  INagiosCoreServiceJsonData as NagiosCoreServiceJsonData
} from '../../scripts/monitors/nagioscore';
import { IcingaOptionsVersion } from '../../scripts/Settings';
import { MonitorStatusBuilder } from './MonitorStatusBuilder';

export class LoadCallbackBuilder extends MonitorStatusBuilder {

  public BuildCallbacks(i: IcingaOptionsVersion): string[] {
    if (i === 'api1') {
      return this.buildIcingaApi();
    }

    if (i === 'nagioscore') {
      return this.buildNagiosCore();
    }

    throw new Error('Not implemented');
  }

  public buildNagiosCore() {
    const hostdata = (): NagiosCoreHostJsonData => {
      const r: NagiosCoreHostJsonData = {
        data: {
          hostlist: {}
        }
      };

      Object.keys(this.hosts).map((hostname) => {
        const host: Monitor.Host = this.hosts[hostname];
        const hostobject: any = {
          name: hostname,
          status: host.getState() === 'UP' ? 0 : 1,
          plugin_output: '',
          problem_has_been_acknowledged: host.hasBeenAcknowledged,
          state_type: host.isInSoftState ? 0 : 1,
          notifications_enabled: !host.notificationsDisabled,
          checks_enabled: !host.checksDisabled,
          scheduled_downtime_depth: host.isInDowntime ? 1 : 0,
        };
        r.data.hostlist[hostname] = hostobject;
      });

      return r;
    };

    const servicedata = (): NagiosCoreServiceJsonData => {
      const r: NagiosCoreServiceJsonData = {
        data: {
          servicelist: {}
        }
      };
      Object.keys(this.hosts).map((hostkey) => {
        const host: Monitor.Host = this.hosts[hostkey];
        r.data.servicelist[hostkey] = {};
        host.services.forEach((service) => {
          r.data.servicelist[hostkey][service.name] = {
            host_name: host.name,
            description: '',
            plugin_output: '',
            problem_has_been_acknowledged: service.hasBeenAcknowledged,
            last_check: 0,
            status: service.getState() === 'OK' ? 2 : service.getState() === 'WARNING' ? 4 : 8,
            state_type: service.isInSoftState ? 0 : 1,
            notifications_enabled: !service.notificationsDisabled,
            checks_enabled: !service.checksDisabled,
            scheduled_downtime_depth: service.isInDowntime ? 1 : 0,
          };
          });
        });
      return r;
    };

    return [JSON.stringify(hostdata()), JSON.stringify(servicedata())];
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
      if (host.checksDisabled) {
        hostobject.attrs['enable_active_checks'] = false;
      }
      if (host.isInDowntime) {
        hostobject.attrs['downtime_depth'] = 1;
      }
    }

    const hostdata = (): IcingaHostJsonData => {
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

    const servicedata = (): IcingaServiceJsonData => {
      const a: IcingaServiceJsonData = {
        results: []
      };
      Object.keys(this.hosts).map((hostkey) => {
        const host: Monitor.Host = this.hosts[hostkey];
        host.services.forEach((service) => {
          let servicedataattributes: {attrs: {[key: string]: any}, name: string};
          a.results.push(servicedataattributes = {
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
          if (service.checksDisabled) {
            servicedataattributes.attrs['enable_active_checks'] = false;
          }
          if (service.isInDowntime) {
            servicedataattributes.attrs['downtime_depth'] = 1;
          }
        });
      });
      return a;
    };

    return [JSON.stringify(hostdata()), JSON.stringify(servicedata())];
  }
}
