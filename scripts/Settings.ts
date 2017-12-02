export type IcingaOptionsVersion = 'cgi' | 'api1' | 'nagioscore';

export interface ImoinMonitorInstance {
    timerPeriod: number;
    icingaversion: IcingaOptionsVersion;
    url: string;
    username: string;
    password: string;
    hostgroup?: string;
}

export class Settings {

    public instances: ImoinMonitorInstance[] = [];

    static urlNoTrailingSlash(instance: ImoinMonitorInstance): string {
        let url = instance.url;
        let l = url.length;
        if (url[l - 1] == '/') {
            l = l - 1;
        }
        return url.substr(0, l);
    }
}
