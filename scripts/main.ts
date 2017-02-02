import {IEnvironment} from "./IEnvironment";
import {Firefox} from "./firefox";
import {Settings} from "./Settings";
import {IMonitor} from "./IMonitor";
import {IcingaApi} from "./icingaapi";

/**
 * Connecting all pieces together
 */

function resolveMonitor(settings: Settings): IMonitor {
    if (settings.icingaversion == "api1") {
        return new IcingaApi();
    }

    return null;
}

var e: IEnvironment = new Firefox();

e.loadSettings().then((settings) => {
    var monitor = resolveMonitor(settings);
    e.initTimer(
        settings.timerPeriod,
        function () {
            monitor.fetchStatus().then(
                status => {
                    e.displayStatus(status);
                }
            )
        });
});
