import { FilterSettings } from '../../Settings';
import { optionalFiltersettings } from './common';
import { FHost } from '.';

function removeAllServicesWithinDowntime(host: FHost) {
  host
    .filterServices((service) => !service.isInDowntime);
}

/**
 * Remove all problems on services & hosts that are in scheduled downtime
 * @param hosts The list of hosts
 * @param filtersettings The filter settings
 */
export function filterDowntime(
  hosts: FHost[],
  filtersettings?: FilterSettings
) {
  if (
    hosts === null
    || optionalFiltersettings(filtersettings, 'filterOutDowntime') === false
  ) {
    return hosts;
  }

  hosts.forEach(removeAllServicesWithinDowntime);
  return hosts
    .filter((fhost) => {
      const host = fhost.getHost();
      const hostIsNotUp = host.getState() !== 'UP';

      // keep host if ack not set
      const keepHost = hostIsNotUp && !host.isInDowntime;

      // keep service if there are still services attached
      const keepService = fhost.getFServices().length > 0;

      // return false to remove host
      return keepHost || keepService;
    })
    ;
}
