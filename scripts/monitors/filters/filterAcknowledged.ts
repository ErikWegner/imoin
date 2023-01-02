import { FilterSettings } from '../../Settings';
import { optionalFiltersettings } from './common';
import { FHost } from '.';

function removeAllAckServices(host: FHost) {
  host
    .filterServices((service) => !service.hasBeenAcknowledged);
}

export function filterAcknowledged(
  hosts: FHost[] | null,
  filtersettings?: FilterSettings
) {
  if (
    hosts === null
    || optionalFiltersettings(filtersettings, 'filterOutAcknowledged') === false
  ) {
    return hosts;
  }

  hosts.forEach(removeAllAckServices);
  return hosts
    .filter((fhost) => {
      const host = fhost.getHost();
      const hostIsNotUp = host.getState() !== 'UP';

      // keep host if ack not set
      const keepHost = hostIsNotUp && !host.hasBeenAcknowledged;

      // keep service if there are still services attached
      const keepService = fhost.getFServices().length > 0;

      // return false to remove host
      return keepHost || keepService;
    })
    ;
}
