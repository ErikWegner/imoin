import { FilterSettings } from '../../Settings.js';

export function optionalFiltersettings(
  filtersettings: FilterSettings | undefined,
  p: keyof FilterSettings): boolean {

  if (filtersettings) {
      return filtersettings[p] as boolean;
  }

  return false;
}
