import { FilterSettings } from '../../Settings';
import { optionalFiltersettings } from './common';
import { FHost } from '.';

function removeAllServicesWithChecksDisabled(host: FHost) {
  host
    .filterServices((service) => !service.checksDisabled);
}

export function filterChecksDisabled(
  hosts: FHost[] | null,
  filtersettings?: FilterSettings
) {
  if (
    hosts === null
    || optionalFiltersettings(filtersettings, 'filterOutDisabledChecks') === false
  ) {
    return hosts;
  }

  hosts.forEach(removeAllServicesWithChecksDisabled);
  return hosts
    .filter((fhost) => {
      const host = fhost.getHost();
      const hostIsNotUp = host.getState() !== 'UP';

      // keep host if ack not set
      const keepHost = hostIsNotUp && !host.checksDisabled;

      // keep service if there are still services attached
      const keepService = fhost.getFServices().length > 0;

      // return false to remove host
      return keepHost || keepService;
    })
    ;
}
