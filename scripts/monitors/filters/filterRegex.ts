import { FHost } from ".";
import { FilterSettings } from "../../Settings";

export function filterResponseByRegex(hosts = <FHost[]>[], filtersettings?: FilterSettings) {
  const fss = filtersettings?.filterServices;
  if (fss && fss.state != "" && (fss.re ?? '').length > 0) {
    const result = fss.state === "keep";
    const re = new RegExp(fss.re);
    hosts.forEach((host) => {
      host.filterServices((service) => result === re.test(service.name));
    });
  }

  return filterHostsByRegex(hosts, filtersettings).filter(
    (host) => host.getFServices().length > 0
  );
}

export function filterHostsByRegex(hosts = <FHost[]>[], filtersettings?: FilterSettings) {
  const s = filtersettings?.filterHosts;
  if (hosts.length > 0 && s && s.state != "" && (s.re ?? '').length > 0) {
    const result = s.state === "keep";
    const re = new RegExp(s.re);
    return hosts.filter((host) => result === re.test(host.getHost().name))
  } else {
    return hosts;
  }
}

