import { Monitor } from '../../scripts/monitors';

export class ServiceBuilder {
  public static create(name: string) {
    return new ServiceBuilder(name);
  }

  protected service: Monitor.Service;

  constructor(name: string) {
    this.service = new Monitor.Service(name);
  }

  public withStatus(state: Monitor.ServiceState) {
    this.service.setStatus(state);
    return this;
  }

  public hasBeenAcknowledged() {
    this.service.hasBeenAcknowledged = true;
    return this;
  }

  public addToHost(host: Monitor.Host) {
    host.addService(this.service);
  }
}
