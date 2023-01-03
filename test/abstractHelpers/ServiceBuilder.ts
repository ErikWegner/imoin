import { Host, Service, ServiceState } from '../../scripts/monitors';

export class ServiceBuilder {
  public static create(name: string) {
    return new ServiceBuilder(name);
  }

  protected service: Service;

  constructor(name: string) {
    this.service = new Service(name);
  }

  public withStatus(state: ServiceState) {
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

  public disableChecks() {
    this.service.checksDisabled = true;
    return this;
  }

  public inSoftState() {
    this.service.isInSoftState = true;
    return this;
  }

  public inDowntime() {
    this.service.isInDowntime = true;
    return this;
  }

  public addToHost(host: Host) {
    host.addService(this.service);
    return this;
  }

  public setup(f: (sb: ServiceBuilder) => void) {
    f(this);
    return this;
  }
}
