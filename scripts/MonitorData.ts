export namespace Monitor {
    export type HostState = "UP" | "DOWN"
    export type ServiceState = "OK" | "WARNING" | "CRITICAL"

    export enum Status {
        GREEN,
        YELLOW,
        RED
    }

    export class Service {
        public status : ServiceState = "CRITICAL";
        public host: string;
        public checkresult: string;

        constructor(readonly name: string) {}

        setStatus(value: Monitor.ServiceState) { this.status = value; }
    }

    export class Host {
        public status: HostState = "DOWN";
        public services: Array<Service> = [];
        public hostlink: string;
        public has_been_acknowledged: boolean = false;
        public checkresult: string;

        constructor(readonly name: string) {}
        
        setState(state: HostState) { this.status = state; }
        getState() { return this.status }

        addService(service: Service) {
            this.services.push(service);
        }
    }

    /* This class must be serializable */
    export class MonitorData {
        public hosts: Array<Host> = [];
        public state: Status;
        public message: string;
        public hostgroupinfo: string = null;
        public totalhosts: number;
        public hostup: number;
        public hosterrors: number;
        public totalservices: number;
        public serviceok: number;
        public servicewarnings: number;
        public serviceerrors: number;
        public updatetime: string;

        setState(state: Status) { this.state = state; }
        getState() { return this.state }

        setMessage(message: string) { this.message = message }
        getMessage() { return this.message }

        addHost(host: Host) {
            this.hosts.push(host)
        }

        getHosts() {return this.hosts; }

        updateCounters() {
            this.totalservices = this.hosts.map(host => host.services.length).reduce((acc, val) => acc += val, 0);
            this.serviceok = this.hosts.map(host => host.services.filter(service => service.status == "OK").length).reduce((acc, val) => acc += val, 0);
            this.servicewarnings = this.hosts.map(host => host.services.filter(service => service.status == "WARNING").length).reduce((acc, val) => acc += val, 0);
            this.serviceerrors = this.totalservices - this.serviceok - this.servicewarnings;

            this.totalhosts = this.hosts.length;
            this.hostup = this.hosts.filter(host => host.status == "UP").length;
            this.hosterrors = this.totalhosts - this.hostup;

            this.setUpdatetime();
            this.updateState();
        }

        private setUpdatetime() {
            let s00 = function(n: number) { return n > 9 ? n : "0" + n};
            let d = new Date;
            this.updatetime = d.getFullYear() + "-" + s00(d.getMonth()) + "-" + s00(d.getDate()) + " " +
             s00(d.getHours()) + ":" + s00(d.getMinutes()) + ":" + s00(d.getSeconds());
        }

        private updateState() {
            this.state = Status.GREEN;
            if (this.servicewarnings > 0) {
                this.state = Status.YELLOW;
            }
            if (this.serviceerrors > 0 ||this.hosterrors > 0) {
                this.state = Status.RED;
            }
        }
    }

    export function ErrorMonitorData(
        message: string
    ): MonitorData {
        let m = new MonitorData();
        m.setState(Status.RED);
        m.setMessage(message);
        return m
    }
}