import { IEnvironment } from './IEnvironment';
import { Settings, ImoinMonitorInstance } from './Settings';
import { IMonitor, IcingaCgi, IcingaApi, NagiosCore, NagiosHtml } from './monitors';

/*
 * Connecting all pieces together
 */

/**
 * Create an instance for the given configuration
 *
 * @param instance The instance configuration
 */
export function resolveMonitor(environment: IEnvironment, instance: ImoinMonitorInstance, index: number): IMonitor | null {
    if (instance.icingaversion === 'api1') {
        return new IcingaApi(environment, instance, index);
    }

    if (instance.icingaversion === 'cgi') {
        return new IcingaCgi(environment, instance, index);
    }

    if (instance.icingaversion === 'nagioscore') {
        return new NagiosCore(environment, instance, index);
    }

    if (instance.icingaversion === 'nagioshtml') {
        return new NagiosHtml(environment, instance, index);
    }

    return null;
}

const monitors: IMonitor[] = [];

export function init(e: IEnvironment) {

    function start() {
        let monitor;
        while (monitors.length > 0) {
            monitor = monitors.pop();
            monitor?.shutdown();
        }

        e.loadSettings().then((settings) => {
            settings.instances.forEach((instance, index) => {
                e.registerMonitorInstance(index, {
                    instancelabel: instance.instancelabel
                });
                monitor = resolveMonitor(e, instance, index);
                if (monitor != null) {
                    monitor.startTimer();
                    monitors.push(monitor);
                }
            });
        });
    }

    start();
    e.onSettingsChanged(start);
}
