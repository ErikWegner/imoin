export type IcingaOptionsVersion = 'cgi' | 'api1' | 'nagioscore';

export interface ImoinMonitorInstance {
    instancelabel: string;
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

    static paramsToInstance(
        instancelabel: string,
        delay: number,
        version: IcingaOptionsVersion,
        url: string,
        user: string,
        password: string
    ): ImoinMonitorInstance {
        return {
            timerPeriod: delay,
            icingaversion: version,
            url: url,
            username: user,
            password: password,
            instancelabel: instancelabel
        }
    }
}
