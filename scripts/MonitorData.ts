export namespace Monitor {
    export type HostState = "UP" | "DOWN"

    export enum Status {
        GREEN,
        YELLOW,
        RED
    }

    export class Service {
        constructor(readonly name: string) {}
    }

    export class Host {
        public status: HostState = "DOWN";
        public services: Array<Service> = [];
        public hostlink: string
        public has_been_acknowledged: boolean = false;

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
        public hostgroupinfo: string
        public totalhosts: number

        setState(state: Status) { this.state = state; }
        getState() { return this.state }

        setMessage(message: string) { this.message = message }
        getMessage() { return this.message }

        addHost(host: Host) {
            this.hosts.push(host)
            this.totalhosts = this.hosts.length
        }

        getHosts() {return this.hosts; }
    }

    export function ErrorMonitorData(
        message: string
    ): MonitorData {
        var m = new MonitorData()
        m.setState(Status.RED)
        m.setMessage(message)
        return m
    }
}