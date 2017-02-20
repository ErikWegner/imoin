import {EnvironmentFactory} from "./IEnvironment";
import {Settings} from "./Settings";
import {IMonitor} from "./IMonitor";
import {IcingaApi} from "./icingaapi";
import {IcingaCgi} from "./icingacgi";

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

    return null;
}

var e = EnvironmentFactory.get();
var monitor: IMonitor = null;

function start() {
    console.log("start");
    if (monitor != null) {
        monitor.shutdown();
    }
    
    e.loadSettings().then((settings) => {
        var monitor = resolveMonitor(settings);
        if (monitor != null) {
            monitor.init(e, settings);
            monitor.startTimer();
        }
    });
}

start()
e.onSettingsChanged(function() { start(); });