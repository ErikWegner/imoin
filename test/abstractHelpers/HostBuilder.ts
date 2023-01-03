import { Host } from '../../scripts/monitors';
import { ServiceBuilder } from './ServiceBuilder';

export class HostBuilder {
  protected activeHost: Host = new Host('uninitialized');

  public Host(name: string) {
    this.activeHost = new Host(name);
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

  public disableNotifications() {
    this.activeHost.notificationsDisabled = true;
    return this;
  }

  public disableChecks() {
    this.activeHost.checksDisabled = true;
    return this;
  }

  public softState() {
    this.activeHost.isInSoftState = true;
    return this;
  }

  public inDowntime() {
    this.activeHost.isInDowntime = true;
    return this;
  }

  public setup(f: (hb: HostBuilder) => void) {
    f(this);
    return this;
  }

  public Service(name: string, servicesetup: (b: ServiceBuilder) => void) {
    const sb = ServiceBuilder.create(name);
    servicesetup(sb);
    sb.addToHost(this.activeHost);
    return this;
  }

  public Done() {
    return this.activeHost;
  }
}
