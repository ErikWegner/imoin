import { HostBuilder } from './HostBuilder';
import { Monitor } from '../../scripts/monitors';

export class MonitorStatusBuilder extends HostBuilder {
  protected hosts: { [name: string]: Monitor.Host } = {};

  public Host(name: string) {
    super.Host(name);
    this.hosts[name] = this.activeHost;
    return this;
  }

  public GetHosts() {
    return Object.keys(this.hosts).map((key) => this.hosts[key]);
  }

  public BuildStatus(): Monitor.MonitorData {
    const data = new Monitor.MonitorData();
    this.GetHosts().forEach((host) => data.addHost(host));
    return data;
  }
}
