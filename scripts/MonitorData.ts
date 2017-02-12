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
        private services: Array<Service> = []
        constructor(readonly name: string) {}
        addService(service: Service) {
            this.services.push(service);
        }
    }

    export class MonitorData {
        private hosts: Array<Host> = []
        constructor(readonly status: Status) {}
    }
}