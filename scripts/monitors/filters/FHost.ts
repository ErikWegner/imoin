import { Monitor } from '../MonitorData';

/**
 * Filtering host.
 */
export class FHost {
  public static map(hosts: Monitor.Host[]) {
    return hosts.map((host) => new FHost(host));
  }
  private fservices: Monitor.Service[] = [];

  constructor(private host: Monitor.Host) {
    host.services.forEach((service) => {
      this.fservices.push(service);
    });
  }

  public filterServices(fn: (service: Monitor.Service) => boolean) {
    this.fservices =
     this.fservices.filter(fn);
  }

  public removeAllServices() {
    this.fservices = [];
  }

  public getHost() {
    return this.host;
  }

  public getFServices() {
    return this.fservices;
  }
}
