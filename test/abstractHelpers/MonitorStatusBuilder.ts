import { Host, MonitorData } from '../monitors';
import { HostBuilder } from './HostBuilder';

export class MonitorStatusBuilder extends HostBuilder {
  protected hosts: { [name: string]: Host } = {};

  public Host(name: string) {
    super.Host(name);
    this.hosts[name] = this.activeHost;
    return this;
  }

  public GetHosts() {
    return Object.keys(this.hosts).map((key) => this.hosts[key]);
  }

  public BuildStatus(): MonitorData {
    const data = new MonitorData();
    this.GetHosts().forEach((host) => data.addHost(host));
    return data;
  }
}
