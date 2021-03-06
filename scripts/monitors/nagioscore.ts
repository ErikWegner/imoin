import { Monitor } from './MonitorData';
import { AbstractMonitor } from './AbstractMonitor';
import { UICommand } from '../UICommand';
import { Constants } from '../constants';

enum NagiosStateType {
  SOFT = 0,
  HARD = 1
}

export interface INagiosCoreHostJsonData {
  data: {
    hostlist: {
      [hostname: string]: {
        name: string,
        status: number,
        state_type: NagiosStateType,
        plugin_output: string,
        problem_has_been_acknowledged: boolean,
        notifications_enabled: boolean,
        checks_enabled: boolean,
        scheduled_downtime_depth: number,
      }
    };
  };
}

export interface INagiosCoreServiceJsonData {
  data: {
    servicelist: {
      [hostname: string]: {
        [servicename: string]: {
          host_name: string,
          description: string,
          status: number,
          last_check: number,
          state_type: NagiosStateType,
          plugin_output: string,
          problem_has_been_acknowledged: boolean,
          notifications_enabled: boolean,
          checks_enabled: boolean,
          scheduled_downtime_depth: number,
        }
      }
    }
  };

}

export class NagiosCore extends AbstractMonitor {
  public fetchStatus(): Promise<Monitor.MonitorData> {
    return new Promise<Monitor.MonitorData>(
      (resolve, reject) => {
        const hosturl = this.settings.url +
          '/cgi-bin/statusjson.cgi?query=hostlist&formatoptions=whitespace&details=true';
        const servicesurl = this.settings.url +
          '/cgi-bin/statusjson.cgi?query=servicelist&formatoptions=whitespace&details=true';

        const hostsrequest = this.environment.load(
          hosturl, this.settings.username, this.settings.password);
        const servicesrequest = this.environment.load(
          servicesurl, this.settings.username, this.settings.password);

        Promise
          .all([hostsrequest, servicesrequest])
          .then((a) => {
            let hostdata;
            let servicedata;
            try {
              if (a[0] === '\n' || a[0] === '') {
                resolve(Monitor.ErrorMonitorData(
                  'Empty host data response.'));
              }
              hostdata = JSON.parse(a[0]);
            } catch (hosterr) {
              resolve(Monitor.ErrorMonitorData('Could not parse host data.', Constants.UrlDebug));
              return;
            }

            try {
              servicedata = JSON.parse(a[1]);
            } catch (servicerrror) {
              resolve(
                Monitor.ErrorMonitorData(
                  'Could not parse service data.', Constants.UrlDebug));
              return;
            }
            const m = this.processData(hostdata, servicedata);
            resolve(m);
          })
          .catch((a) => {
            let msg = 'Connection error: ';
            if (typeof a === 'string') {
              msg += a;
            } else {
              msg += 'Check settings and log.';
            }
            resolve(Monitor.ErrorMonitorData(msg));
          });
      });
  }

  protected handleUICommand(param: UICommand): void {
    throw new Error('Method not implemented.');
  }

  protected processData(
    hostdata: INagiosCoreHostJsonData,
    servicedata: INagiosCoreServiceJsonData
  ): Monitor.MonitorData {
    if (hostdata == null || servicedata == null) {
      return Monitor.ErrorMonitorData('Result empty');
    }
    const m = new Monitor.MonitorData();
    const hostByName: { [name: string]: Monitor.Host } = {};
    const index = this.index;
    Object.keys(hostdata.data.hostlist).forEach((hostname) => {
      const hostdatahost = hostdata.data.hostlist[hostname];
      const host = new Monitor.Host(hostdatahost.name);
      host.instanceindex = index;
      hostByName[host.name] = host;
      host.hostlink = this.settings.url + '/cgi-bin/extinfo.cgi?type=1&host=' + hostdatahost.name;
      host.setState(hostdatahost.status === 2 ? 'UP' : 'DOWN');
      host.checkresult = hostdatahost.plugin_output;
      host.hasBeenAcknowledged = hostdatahost.problem_has_been_acknowledged;
      host.isInSoftState = hostdatahost.state_type === 0;
      host.notificationsDisabled = !hostdatahost.notifications_enabled;
      host.checksDisabled = !hostdatahost.checks_enabled;
      host.isInDowntime = hostdatahost.scheduled_downtime_depth > 0;
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
              service.setState('OK');
            } else if (servicedataservice.status === 4) {
              service.setState('WARNING');
            }
            service.checkresult = servicedataservice.plugin_output;
          } else {
            service.checkresult = 'Check did not run yet.';
          }
          service.hasBeenAcknowledged = servicedataservice.problem_has_been_acknowledged;
          service.isInSoftState = servicedataservice.state_type === 0;
          service.notificationsDisabled = !servicedataservice.notifications_enabled;
          service.checksDisabled = !servicedataservice.checks_enabled;
          service.isInDowntime = servicedataservice.scheduled_downtime_depth > 0;
          service.host = host.name;
          service.servicelink = this.buildServiceLink(service);
          host.addService(service);
        }
      });
    });

    return m;
  }

  protected buildServiceLink(service: Monitor.Service): string {
    const encodedServicename = encodeURIComponent(service.name).replace(/\%20/g, '+');
    return this.settings.url +
      '/cgi-bin/extinfo.cgi?' +
      ([
        'type=2',
        'host=' + service.host,
        'service=' + encodedServicename
      ].join('&'));
  }
}
