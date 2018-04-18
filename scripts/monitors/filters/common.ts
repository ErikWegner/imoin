import { FilterSettings } from '../../Settings';

export function optionalFiltersettings(
  filtersettings: FilterSettings,
  p: keyof FilterSettings): boolean {

  if (filtersettings) {
      return filtersettings[p] as boolean;
  }

  return false;
}
