import { FHost } from ".";
import { FilterSettings } from "../../Settings";

export function filterResponseByRegex(hosts = <FHost[]>[], filtersettings?: FilterSettings) {
  const fss = filtersettings?.filterServices;
  if (fss && fss.state != "" && fss.re != null) {
    const result = fss.state === "keep";
    hosts.forEach((host) => {
      host.filterServices((service) => result === fss.re.test(service.name));
    });
  }

  return filterHostsByRegex(hosts, filtersettings).filter(
    (host) => host.getFServices().length > 0
  );
}

export function filterHostsByRegex(hosts = <FHost[]>[], filtersettings?: FilterSettings) {
  const s = filtersettings?.filterHosts;
  if (hosts.length > 0 && s && s.state != "" && s.re != null) {
    const result = s.state === "keep";
    return hosts.filter((host) => result === s.re.test(host.getHost().name))
  } else {
    return hosts;
  }
}

