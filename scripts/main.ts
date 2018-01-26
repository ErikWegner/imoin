import { IEnvironment } from './IEnvironment';
import { Settings, ImoinMonitorInstance } from './Settings';
import { IMonitor } from './IMonitor';
import { IcingaApi } from './icingaapi';
import { IcingaCgi } from './icingacgi';
import { NagiosCore } from './nagioscore';
import { NagiosHtml } from './nagioshtml';

/*
 * Connecting all pieces together
 */

/**
 * Create an instance for the given configuration
 * 
 * @param instance The instance configuration
 */
export function resolveMonitor(instance: ImoinMonitorInstance): IMonitor {
    if (instance.icingaversion == 'api1') {
        return new IcingaApi();
    }

    if (instance.icingaversion == 'cgi') {
        return new IcingaCgi();
    }

    if (instance.icingaversion == 'nagioscore') {
        return new NagiosCore();
    }

    if (instance.icingaversion == 'nagioshtml') {
        return new NagiosHtml();
    }

    return null;
}

let monitors: IMonitor[] = [];

export function init(e: IEnvironment) {

    function start() {
        let monitor;
        while (monitor = monitors.pop()) {
            monitor.shutdown();
        }

        e.loadSettings().then((settings) => {
            settings.instances.forEach((instance, index) => {
                e.registerMonitorInstance(index, {
                    instancelabel: instance.instancelabel
                });
                monitor = resolveMonitor(instance);
                if (monitor != null) {
                    monitor.init(e, instance, index);
                    monitor.startTimer();
                    monitors.push(monitor);
                }
            });
        });
    }

    start();
    e.onSettingsChanged(start);
}
