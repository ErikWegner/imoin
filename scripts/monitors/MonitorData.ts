import { IPanelMonitorData } from '../IPanelMonitorData';

// tslint:disable-next-line:no-namespace
export namespace Monitor {
    export type HostState = 'UP' | 'DOWN';
    export type ServiceState = 'OK' | 'WARNING' | 'CRITICAL';

    export enum Status {
        GREEN,
        YELLOW,
        RED
    }

    export class Service {
        public status: ServiceState = 'CRITICAL';
        public host: string;
        public checkresult: string;
        public servicelink: string;

        constructor(readonly name: string) {
        }

        public setStatus(value: Monitor.ServiceState) {
            this.status = value;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    export class Host {
        public status: HostState = 'DOWN';
        public services: Service[] = [];
        public hostlink: string;
        public hasBeenAcknowledged: boolean = false;
        public checkresult: string;
        public instanceindex: number;
        public appearsInShortlist: boolean = false;

        constructor(readonly name: string) {
        }

        public setState(state: HostState) {
            this.status = state;
        }

        public getState() {
            return this.status;
        }

        public addService(service: Service) {
            this.services.push(service);
        }
    }

    /* This class must be serializable */
    // tslint:disable-next-line:max-classes-per-file
    export class MonitorData {
        public static renderDate(indate?: Date) {
            if (!indate) {
                indate = new Date();
            }
            const s00 = (s: number) => {
                const r = s.toString();
                return (r.length < 2 ? '0' + r : r);
            };

            return indate.getFullYear() + '-' +
                s00(indate.getMonth() + 1) + '-' +
                s00(indate.getDate()) + ' ' +
                s00(indate.getHours()) + ':' +
                s00(indate.getMinutes()) + ':' +
                s00(indate.getSeconds());
        }

        public hosts: Host[] = [];
        public state: Status;
        public message: string;
        public url: string;
        public hostgroupinfo: string = null;
        public totalhosts: number;
        public hostup: number;
        public hosterrors: number;
        public totalservices: number;
        public serviceok: number;
        public servicewarnings: number;
        public serviceerrors: number;
        public updatetime: string;
        public instanceLabel: string;

        public setState(state: Status) {
            this.state = state;
        }

        public getState() {
            return this.state;
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

        public updateCounters() {
            this.totalservices = this
                .hosts
                .map((host) => host.services.length)
                .reduce((acc, val) => acc += val, 0);

            this.serviceok = this
                .hosts
                .map((host) => host.services.filter(
                    (service) => service.status === 'OK').length)
                .reduce((acc, val) => acc += val, 0);

            this.servicewarnings = this
                .hosts
                .map((host) => host.services.filter(
                    (service) => service.status === 'WARNING').length)
                .reduce((acc, val) => acc += val, 0);
            this.serviceerrors = this.totalservices - this.serviceok - this.servicewarnings;

            this.totalhosts = this.hosts.length;
            this.hostup = this.hosts.filter((host) => host.status === 'UP').length;
            this.hosterrors = this.totalhosts - this.hostup;

            this.setUpdatetime();
            this.updateState();
        }

        private setUpdatetime() {
            const d = new Date();
            this.updatetime = Monitor.MonitorData.renderDate(d);
        }

        private updateState() {
            this.state = Status.GREEN;
            if (this.servicewarnings > 0) {
                this.state = Status.YELLOW;
            }
            if (this.serviceerrors > 0 || this.hosterrors > 0 || this.message) {
                this.state = Status.RED;
            }
        }
    }

    export function ErrorMonitorData(
        message: string,
        url?: string): MonitorData {
        const m = new MonitorData();
        m.setState(Status.RED);
        m.setMessage(message);
        m.url = url;
        m.updatetime = MonitorData.renderDate();
        return m;
    }

    // tslint:disable-next-line:max-classes-per-file
    export class PanelMonitorData extends MonitorData {
        public instances: { [index: number]: IPanelMonitorData } = {};
    }
}
