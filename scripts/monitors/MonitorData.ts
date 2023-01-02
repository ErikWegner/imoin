import { IPanelMonitorData } from '../IPanelMonitorData';
import { FHost } from './filters';

export type HostState = 'UP' | 'DOWN';
export type ServiceState = 'OK' | 'WARNING' | 'CRITICAL';

export enum Status {
  GREEN,
  YELLOW,
  RED,
}

export class Service {
  public host?: string;
  public checkresult?: string;
  public servicelink?: string;
  public hasBeenAcknowledged = false;
  public notificationsDisabled = false;
  public checksDisabled = false;
  public isInSoftState = false;
  public isInDowntime = false;
  public appearsInShortlist = false;
  private status: ServiceState = 'CRITICAL';
  private filteredStatus: ServiceState = 'CRITICAL';

  constructor(readonly name: string) {}

  public setState(value: ServiceState) {
    this.status = value;
    this.filteredStatus = value;
  }

  public getState() {
    return this.status;
  }
}

export class Host {
  public static readonly IgnoreServices = false;
  public services: Service[] = [];
  public hostlink?: string;
  public hasBeenAcknowledged = false;
  public notificationsDisabled = false;
  public checksDisabled = false;
  public isInSoftState = false;
  public isInDowntime = false;
  public checkresult?: string;
  public instanceindex?: number;
  public appearsInShortlist = false;
  private status: HostState = 'DOWN';
  private filteredStatus: HostState = 'DOWN';

  constructor(readonly name: string) {}

  public setState(state: HostState) {
    this.status = state;
    this.filteredStatus = state;
  }

  public getState() {
    return this.status;
  }

  public addService(service: Service) {
    this.services.push(service);
  }

  // TODO: remove
  public filterClone(copyServices: boolean): Host {
    const r = new Host(this.name);
    r.status = this.status;
    r.hasBeenAcknowledged = this.hasBeenAcknowledged;
    r.appearsInShortlist = this.appearsInShortlist;
    if (copyServices) {
      this.services.forEach((s) => r.addService(s), r);
    }
    return r;
  }
}

/* This class must be serializable */
export class MonitorData {
  public static renderDate(indate?: Date) {
    if (!indate) {
      indate = new Date();
    }
    const s00 = (s: number) => {
      const r = s.toString();
      return r.length < 2 ? '0' + r : r;
    };

    return `${indate.getFullYear()}-${s00(indate.getMonth() + 1)}-${s00(
      indate.getDate()
    )} ${s00(indate.getHours())}:${s00(indate.getMinutes())}:${s00(
      indate.getSeconds()
    )}`;
  }

  public hosts: Host[] = [];
  public message = '';
  public url?: string;
  public hostgroupinfo: string | null = null;
  public totalhosts = 0;
  public totalservices = 0;
  public hostup = 0;
  public hosterrors = 0;
  public serviceok = 0;
  public servicewarnings = 0;
  public serviceerrors = 0;
  public updatetime?: string;
  public instanceLabel?: string;
  public state: Status = Status.GREEN;
  public filteredState: Status = Status.GREEN;
  public filteredHostup = 0;
  public filteredHosterrors = 0;
  public filteredServiceok = 0;
  public filteredServicewarnings = 0;
  public filteredServiceerrors = 0;

  public setState(state: Status) {
    this.state = state;
  }

  public getState() {
    return this.state;
  }

  public setFilteredState(state: Status) {
    this.filteredState = state;
  }

  public getFilteredState() {
    return this.filteredState;
  }

  public setMessage(message: string) {
    this.message = message;
  }

  public getMessage() {
    return this.message;
  }

  public addHost(host: Host) {
    this.hosts.push(host);
  }

  public getHosts() {
    return this.hosts;
  }

  public getHostByName(name: string): Host {
    const a = this.hosts.filter((h) => h.name === name);
    if (a.length > 0) {
      return a[0];
    }

    const b = new Host(name);
    this.addHost(b);

    return b;
  }

  public updateCounters(filteredHosts?: FHost[] | null) {
    this.updateCountersUnmodified();
    this.updateCountersFiltered(filteredHosts ?? null);

    this.setUpdatetime();
    this.updateState();
  }

  public addCountersAndMergeState(other: MonitorData) {
    this.totalhosts += other.totalhosts;
    this.hostup += other.hostup;
    this.filteredHostup += other.filteredHostup;
    this.hosterrors += other.hosterrors;
    this.filteredHosterrors += other.filteredHosterrors;

    this.totalservices += other.totalservices;
    this.serviceok += other.serviceok;
    this.filteredServiceok += other.filteredServiceok;
    this.servicewarnings += other.servicewarnings;
    this.filteredServicewarnings += other.filteredServicewarnings;
    this.serviceerrors += other.serviceerrors;
    this.filteredServiceerrors += other.filteredServiceerrors;

    this.state = Math.max(this.state, other.state);
    this.filteredState = Math.max(this.filteredState, other.filteredState);

    this.setUpdatetime();
  }

  private updateCountersUnmodified() {
    this.totalservices = this.hosts
      .map((host) => host.services.length)
      .reduce((acc, val) => (acc += val), 0);

    this.serviceok = this.hosts
      .map(
        (host) =>
          host.services.filter((service) => service.getState() === 'OK').length
      )
      .reduce((acc, val) => (acc += val), 0);

    this.servicewarnings = this.hosts
      .map(
        (host) =>
          host.services.filter((service) => service.getState() === 'WARNING')
            .length
      )
      .reduce((acc, val) => (acc += val), 0);
    this.serviceerrors =
      this.totalservices - this.serviceok - this.servicewarnings;

    this.totalhosts = this.hosts.length;
    this.hostup = this.hosts.filter((host) => host.getState() === 'UP').length;
    this.hosterrors = this.totalhosts - this.hostup;
  }

  private updateCountersFiltered(filteredHosts: FHost[] | null) {
    if (filteredHosts == null) {
      // copy values to filtered fields
      this.filteredServiceerrors = this.serviceerrors;
      this.filteredServicewarnings = this.servicewarnings;
      this.filteredServiceok = this.serviceok;
      this.filteredHostup = this.hostup;
      this.filteredHosterrors = this.hosterrors;

      return;
    }

    const servicecounters: { [key in ServiceState]: number } = {
      OK: 0,
      WARNING: 0,
      CRITICAL: 0,
    };

    filteredHosts.forEach((fhost) => {
      fhost.getFServices().forEach((fservice) => {
        const index = fservice.getState();
        servicecounters[index] = servicecounters[index] + 1;
      });
    });

    this.filteredServiceerrors = servicecounters['CRITICAL'];
    this.filteredServicewarnings = servicecounters['WARNING'];
    this.filteredServiceok =
      this.totalservices -
      this.filteredServiceerrors -
      this.filteredServicewarnings;

    this.filteredHosterrors = filteredHosts.filter(
      (fhost) => fhost.getHost().getState() !== 'UP'
    ).length;
    this.filteredHostup = this.totalhosts - this.filteredHosterrors;
  }

  private setUpdatetime() {
    const d = new Date();
    this.updatetime = MonitorData.renderDate(d);
  }

  private updateState() {
    this.state = Status.GREEN;
    if (this.servicewarnings > 0) {
      this.state = Status.YELLOW;
    }
    if (this.serviceerrors > 0 || this.hosterrors > 0 || this.message) {
      this.state = Status.RED;
    }
    this.filteredState = Status.GREEN;
    if (this.filteredServicewarnings > 0) {
      this.filteredState = Status.YELLOW;
    }
    if (
      this.filteredServiceerrors > 0 ||
      this.filteredHosterrors > 0 ||
      this.message
    ) {
      this.filteredState = Status.RED;
    }
  }
}

export function ErrorMonitorData(message: string, url?: string): MonitorData {
  const m = new MonitorData();
  m.setState(Status.RED);
  m.setMessage(message);
  m.url = url;
  m.updatetime = MonitorData.renderDate();
  return m;
}

export class PanelMonitorData extends MonitorData {
  public instances: { [index: number]: IPanelMonitorData } = {};
}
