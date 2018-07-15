import { FHost } from '.';
import { FilterSettings } from '../../Settings';
import { optionalFiltersettings } from './common';

export function filterServicesOnDownHosts(
  hosts: FHost[],
  filtersettings?: FilterSettings
) {
  if (
    hosts === null
    || optionalFiltersettings(filtersettings, 'filterOutServicesOnDownHosts') === false
  ) {
    return hosts;
  }

  hosts
    .filter((host) => host.getHost().getState() !== 'UP')
    .forEach((host) => host.removeAllServices());

  return hosts;
}
