export type IcingaOptionsVersion = "cgi" | "api1" | "nagioscore" ;

export class Settings {
    constructor(
        public timerPeriod = 5,
        public icingaversion: IcingaOptionsVersion,
        public url: string,
        public username: string,
        public password: string,
        public hostgroup?: string
    ) {
    }

    static urlNoTrailingSlash(settings: Settings): string {
        let url = settings.url;
        let l = url.length;
        if (url[l-1] == "/") {
            l = l - 1;
        }
        return url.substr(0, l);
    }
}
