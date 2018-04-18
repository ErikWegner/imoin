import { Monitor } from '../MonitorData';
import { FilterSettings } from '../../Settings';
import { FHost } from '.';

function removeAllOKServices(host: FHost) {
  host
    .filterServices((service) => service.getState() !== 'OK');
}

function removeUPHostsWithoutServices(host: FHost): boolean {
  const hostUP = host.getHost().getState() === 'UP';
  const servicesNotOK = host.getFServices().length;
  return !(hostUP && servicesNotOK === 0);
}

/**
 * Remove all hosts that are UP and have no service problems.
 * @param hosts The list of hosts
 * @param filtersettings The filter settings
 */
export function filterUp(
  hosts: FHost[],
  filtersettings?: FilterSettings
) {
  if (hosts === null) {
    return null;
  }

  hosts.forEach(removeAllOKServices);
  return hosts.filter(removeUPHostsWithoutServices);
}
