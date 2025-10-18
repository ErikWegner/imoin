import { FilterSettings } from '../../Settings.js';
import { HostV3 } from '../MonitorData.js';
import { FHost } from './FHost.js';

function removeAllOKServices(host: FHost) {
  host.filterServices((service) => service.getState() !== 'OK');
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
  hosts: FHost[] | null,
  _filtersettings?: FilterSettings,
) {
  if (hosts === null) {
    return null;
  }

  hosts.forEach(removeAllOKServices);
  return hosts.filter(removeUPHostsWithoutServices);
}

/**
 * Remove all hosts that are UP and have no service problems.
 * @param hosts The list of hosts
 * @param filtersettings The filter settings
 */
export const filterUpV3 = (
  hosts: HostV3[] | null,
  _filtersettings: FilterSettings | null,
) => {
  return (hosts || []).filter(
    (host) =>
      host.services.some((service) => service.status !== 'OK') ||
      host.status !== 'UP',
  );
};
