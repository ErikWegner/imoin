import { FilterSettings } from '../../Settings';
import { optionalFiltersettings } from './common';
import { FHost } from '.';

function removeAllServicesWithNotificationsDisabled(host: FHost) {
  host
    .filterServices((service) => !service.notificationsDisabled);
}

export function filterNotificationDisabled(
  hosts: FHost[] | null,
  filtersettings?: FilterSettings
) {
  if (
    hosts === null
    || optionalFiltersettings(filtersettings, 'filterOutDisabledNotifications') === false
  ) {
    return hosts;
  }

  hosts.forEach(removeAllServicesWithNotificationsDisabled);
  return hosts
    .filter((fhost) => {
      const host = fhost.getHost();
      const hostIsNotUp = host.getState() !== 'UP';

      // keep host if ack not set
      const keepHost = hostIsNotUp && !host.notificationsDisabled;

      // keep service if there are still services attached
      const keepService = fhost.getFServices().length > 0;

      // return false to remove host
      return keepHost || keepService;
    })
    ;
}
