import { Host, Service } from '../MonitorData';

/**
 * Filtering host.
 */
export class FHost {
  public static map(hosts: Host[]) {
    return hosts.map((host) => new FHost(host));
  }
  private fservices: Service[] = [];

  constructor(private host: Host) {
    host.services.forEach((service) => {
      this.fservices.push(service);
    });
  }

  public filterServices(fn: (service: Service) => boolean) {
    this.fservices = this.fservices.filter(fn);
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
