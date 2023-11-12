import { FHost } from ".";
import { FilterSettings } from "../../Settings";

export function filterHostsByRegex(hosts: FHost[], filtersettings?: FilterSettings) {
  const s = filtersettings?.filterHosts;
  if (hosts.length > 0 && s && s.state != "" && s.re != null) {
    const result = s.state === "keep";
    return hosts.filter((host) => result === s.re.test(host.getHost().name))
  } else {
    return hosts;
  }
}

