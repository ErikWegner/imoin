import { FilterSettings } from '../../Settings.js';
import { optionalFiltersettings } from './common.js';
import { FHost } from './FHost.js';

function removeAllSoftStateServices(host: FHost) {
  host
    .filterServices((service) => !service.isInSoftState);
}

export function filterSoftStates(
  hosts: FHost[] | null,
  filtersettings?: FilterSettings
) {
  if (
    hosts === null
    || optionalFiltersettings(filtersettings, 'filterOutSoftStates') === false
  ) {
    return hosts;
  }

  hosts.forEach(removeAllSoftStateServices);
  return hosts
    .filter((fhost) => {
      const host = fhost.getHost();
      const hostIsNotUp = host.getState() !== 'UP';

      // keep host if not in soft state
      const keepHost = hostIsNotUp && !host.isInSoftState;

      // keep service if there are still services attached
      const keepService = fhost.getFServices().length > 0;

      // return false to remove host
      return keepHost || keepService;
    })
    ;
}
