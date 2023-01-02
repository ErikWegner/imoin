export type IcingaOptionsVersion = 'cgi' | 'api1' | 'nagioscore' | 'nagioshtml';

export interface ImoinMonitorInstance {
    instancelabel: string;
    timerPeriod: number;
    icingaversion: IcingaOptionsVersion;
    url: string;
    username: string;
    password: string;
    hostgroup?: string;
    filtersettings?: FilterSettings;
}

export interface Sound {
    id: string;
    filename: string;
    data: string;
}

export interface RegExMatchSettings {
    re: RegExp;
    filterOut: boolean;
}

export interface FilterSettings {
    filterOutAcknowledged: boolean;
    filterOutDisabledNotifications: boolean;
    filterOutDisabledChecks: boolean;
    filterOutSoftStates: boolean;
    filterOutDowntime: boolean;
    filterOutServicesOnDownHosts: boolean;
    filterOutServicesOnAcknowledgedHosts: boolean;
    filterOutFlapping: boolean;
    filterOutAllDown: boolean;
    filterOutAllUnreachable: boolean;
    filterOutAllUnknown: boolean;
    filterOutAllWarning: boolean;
    filterOutAllCritical: boolean;
    filterHosts: RegExMatchSettings | null;
    filterServices: RegExMatchSettings | null;
    filterInformation: RegExMatchSettings | null;
}

export class Settings {

    public static urlNoTrailingSlash(instance: ImoinMonitorInstance): string {
        const url = instance.url;
        let l = url.length;
        if (url[l - 1] === '/') {
            l = l - 1;
        }
        return url.substr(0, l);
    }

    public static paramsToInstance(
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
            url,
            username: user,
            password,
            instancelabel
        };
    }

    public instances: ImoinMonitorInstance[] = [];
    public fontsize: number = 100;
    public inlineresults: boolean = false;
    public sounds: { [id: string]: Sound } = {};
}
