import { FHost } from './FHost.js';
import { FilterSettings } from '../../Settings.js';
import { optionalFiltersettings } from './common.js';

export function filterServicesOnDownHosts(
  hosts: FHost[] | null,
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
