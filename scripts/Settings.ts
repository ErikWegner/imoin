import {IMonitor} from "./IMonitor";

export class Settings {
    constructor(
        public timerPeriod = 5,
        public icingaversion: string,
        public url: string
    ) {
    }
}
