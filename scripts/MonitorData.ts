export namespace Monitor {
    export type HostState = 'UP' | 'DOWN'
    export type ServiceState = 'OK' | 'WARNING' | 'CRITICAL'

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

        setStatus(value: Monitor.ServiceState) {
            this.status = value;
        }
    }

    export class Host {
        public status: HostState = 'DOWN';
        public services: Array<Service> = [];
        public hostlink: string;
        public has_been_acknowledged: boolean = false;
        public checkresult: string;

        constructor(readonly name: string) {
        }

        setState(state: HostState) {
            this.status = state;
        }

        getState() {
            return this.status
        }

        addService(service: Service) {
            this.services.push(service);
        }
    }

    /* This class must be serializable */
    export class MonitorData {
        public hosts: Array<Host> = [];
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

        setState(state: Status) {
            this.state = state;
        }

        getState() {
            return this.state
        }

        setMessage(message: string) {
            this.message = message
        }

        getMessage() {
            return this.message
        }

        addHost(host: Host) {
            this.hosts.push(host)
        }

        getHosts() {
            return this.hosts;
        }

        getHostByName(name: string): Host {
            let a = this.hosts.filter(h => h.name == name);
            if (a.length > 0) {
                return a[0];
            }

            let b = new Host(name);
            this.addHost(b);

            return b;
        }

        updateCounters() {
            this.totalservices = this.hosts.map(host => host.services.length).reduce((acc, val) => acc += val, 0);
            this.serviceok = this.hosts.map(host => host.services.filter(service => service.status == 'OK').length).reduce((acc, val) => acc += val, 0);
            this.servicewarnings = this.hosts.map(host => host.services.filter(service => service.status == 'WARNING').length).reduce((acc, val) => acc += val, 0);
            this.serviceerrors = this.totalservices - this.serviceok - this.servicewarnings;

            this.totalhosts = this.hosts.length;
            this.hostup = this.hosts.filter(host => host.status == 'UP').length;
            this.hosterrors = this.totalhosts - this.hostup;

            this.setUpdatetime();
            this.updateState();
        }

        static renderDate(indate: Date) {
            let s00 = function (s: number) {
                let r = s.toString();
                return (r.length < 2 ? '0' + r : r);
            };

            return indate.getFullYear() + '-' + s00(indate.getMonth() + 1) + '-' + s00(indate.getDate()) + ' ' + s00(indate.getHours()) + ':' + s00(indate.getMinutes()) + ':' + s00(indate.getSeconds());
        }

        private setUpdatetime() {
            let d = new Date;
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

    export function ErrorMonitorData(message: string,
        url?: string): MonitorData {
        let m = new MonitorData();
        m.setState(Status.RED);
        m.setMessage(message);
        m.url = url;
        return m
    }
}