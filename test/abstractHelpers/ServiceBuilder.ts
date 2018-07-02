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
    this.service.setState(state);
    return this;
  }

  public hasBeenAcknowledged() {
    this.service.hasBeenAcknowledged = true;
    return this;
  }

  public notificationsDisabled() {
    this.service.notificationsDisabled = true;
    return this;
  }

  public inSoftState(): any {
    this.service.isInSoftState = true;
    return this;
  }

  public addToHost(host: Monitor.Host) {
    host.addService(this.service);
    return this;
  }

  public setup(f: (sb: ServiceBuilder) => void) {
    f(this);
    return this;
  }
}
