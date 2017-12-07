import { IEnvironment } from './IEnvironment';
import { Settings, ImoinMonitorInstance } from './Settings';
import { IMonitor } from './IMonitor';
import { IcingaApi } from './icingaapi';
import { IcingaCgi } from './icingacgi';
import { NagiosCore } from './nagioscore';

/**
 * Connecting all pieces together
 */

function resolveMonitor(instance: ImoinMonitorInstance): IMonitor {
    if (instance.icingaversion == 'api1') {
        return new IcingaApi();
    }

    if (instance.icingaversion == 'cgi') {
        return new IcingaCgi();
    }

    if (instance.icingaversion == 'nagioscore') {
        return new NagiosCore();
    }

    return null;
}

let monitor: IMonitor = null;

export function init(e: IEnvironment) {

    function start() {
        if (monitor != null) {
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
                }
            });
        });
    }

    start();
    e.onSettingsChanged(() => { start(); });
}
