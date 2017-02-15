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

    urlNoTrailingSlash(): string {
        let l = this.url.length;
        if (this.url[l-1] == "/") {
            l = l - 1;
        }
        return this.url.substr(0, l);
    }
}
