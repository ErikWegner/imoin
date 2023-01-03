import { FHost } from './FHost.js';
import { FilterSettings } from '../../Settings.js';
import { optionalFiltersettings } from './common.js';

export function filterServicesOnAcknowledgedHosts(
  hosts: FHost[] | null,
  filtersettings?: FilterSettings
) {
  if (
    hosts === null
    || optionalFiltersettings(filtersettings, 'filterOutServicesOnAcknowledgedHosts') === false
  ) {
    return hosts;
  }

  hosts
    .filter((host) => host.getHost().hasBeenAcknowledged)
    .forEach((host) => host.removeAllServices());

  return hosts;
}
