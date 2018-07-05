import { FHost } from '.';
import { FilterSettings } from '../../Settings';
import { optionalFiltersettings } from './common';

export function filterServicesOnAcknowledgedHosts(
  hosts: FHost[],
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
