export class Settings {
    constructor(
        public timerPeriod = 5,
        public icingaversion: string,
        public url: string,
        public username: string,
        public password: string,
        public hostgroup?: string
    ) {
    }
}
