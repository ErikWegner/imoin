import { IEnvironment } from './IEnvironment.js';
import {
  IcingaApi,
  IcingaCgi,
  IMonitor,
  NagiosCore,
  NagiosHtml,
} from './monitors/index.js';
import { ImoinMonitorInstance } from './Settings.js';

/*
 * Connecting all pieces together
 */

/**
 * Create an instance for the given configuration
 *
 * @param instance The instance configuration
 */
export function resolveMonitor(
  environment: IEnvironment,
  instance: ImoinMonitorInstance,
  index: number
): IMonitor | undefined {
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
}

const monitors: IMonitor[] = [];

export function init(environment: IEnvironment) {
  function start() {
    let monitor: IMonitor | undefined;
    while ((monitor = monitors.pop())) {
      monitor.shutdown();
    }

    void environment.loadSettings().then((settings) => {
      settings.instances.forEach((instance, index) => {
        environment.registerMonitorInstance(index, {
          instancelabel: instance.instancelabel,
        });
        monitor = resolveMonitor(environment, instance, index);
        if (monitor != null) {
          monitor.startTimer();
          monitors.push(monitor);
        }
      });
    });
  }

  start();
  environment.onSettingsChanged(start);
}
