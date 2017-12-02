import { IEnvironment } from './IEnvironment';
import { Settings } from './Settings';
import { IMonitor } from './IMonitor';
import { IcingaApi } from './icingaapi';
import { IcingaCgi } from './icingacgi';
import { NagiosCore } from './nagioscore';

/**
 * Connecting all pieces together
 */

function resolveMonitor(settings: Settings): IMonitor {
    if (settings.icingaversion == "api1") {
        return new IcingaApi();
    }

    if (settings.icingaversion == "cgi") {
        return new IcingaCgi();
    }

    if (settings.icingaversion == "nagioscore") {
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
            monitor = resolveMonitor(settings);
            if (monitor != null) {
                monitor.init(e, settings);
                monitor.startTimer();
            }
        });
    }

    start();
    e.onSettingsChanged(() => { start(); });
}
