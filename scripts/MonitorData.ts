export namespace Monitor {
    export enum Status {
        GREEN,
        YELLOW,
        RED
    }

    export class Service {
        constructor(readonly name: string) {}
    }

    export class Host {
        private state: Status = Status.RED;
        private services: Array<Service> = [];
        constructor(readonly name: string) {}
        
        setState(state: Status) { this.state = state; }
        getState() { return this.state }

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

        setState(state: Status) { this.state = state; }
        getState() { return this.state }

        setMessage(message: string) { this.message = message }
        getMessage() { return this.message }

        addHost(host: Host) {
            this.hosts.push(host)
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