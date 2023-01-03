import { Host, Service } from '../scripts/monitors/index.js';
import {
  FHost,
  filterAcknowledged,
  filterChecksDisabled,
  filterDowntime,
  filterNotificationDisabled,
  filterSoftStates,
} from '../scripts/monitors/filters/index.js';
import { FilterSettings } from '../scripts/Settings.js';
import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder.js';
import { HostBuilder } from './abstractHelpers/HostBuilder.js';
import { ServiceBuilder } from './abstractHelpers/ServiceBuilder.js';

export const filterSettingsTests: {
  [filterName: string]: {
    setupFilterSettingsBuilder: (fsb: FilterSettingsBuilder) => void;
    setupHost: (lcb: HostBuilder) => void;
    hostProperty: keyof Host;
    hostQueryParameter: string;
    setupService: (sb: ServiceBuilder) => void;
    serviceProperty: keyof Service;
    serviceQueryParameter: string;
    filterFunction: (
      hosts: FHost[] | null,
      filtersettings?: FilterSettings
    ) => FHost[] | null;
    filterFlagText: string;
  };
} = {
  hasBeenAcknowledged: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutAcknowledged(),
    setupHost: (lcb) => lcb.HasBeenAcknowledged(),
    hostProperty: 'hasBeenAcknowledged',
    hostQueryParameter: 'acknowledgement',
    setupService: (sb) => sb.hasBeenAcknowledged(),
    serviceProperty: 'hasBeenAcknowledged',
    serviceQueryParameter: 'acknowledgement',
    filterFunction: filterAcknowledged,
    filterFlagText: 'with ack flag',
  },
  softState: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutSoftStates(),
    setupHost: (lcb) => lcb.softState(),
    hostProperty: 'isInSoftState',
    hostQueryParameter: 'state_type',
    setupService: (sb) => sb.inSoftState(),
    serviceProperty: 'isInSoftState',
    serviceQueryParameter: 'state_type',
    filterFunction: filterSoftStates,
    filterFlagText: 'in soft state',
  },
  notificationDisabled: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutNotificationDisabled(),
    setupHost: (lcb) => lcb.disableNotifications(),
    hostProperty: 'notificationsDisabled',
    hostQueryParameter: 'enable_notifications',
    setupService: (sb) => sb.notificationsDisabled(),
    serviceProperty: 'notificationsDisabled',
    serviceQueryParameter: 'enable_notifications',
    filterFunction: filterNotificationDisabled,
    filterFlagText: 'with notifications disabled',
  },
  filterChecksDisabled: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutDisabledChecks(),
    setupHost: (lcb) => lcb.disableChecks(),
    hostProperty: 'checksDisabled',
    hostQueryParameter: 'enable_active_checks',
    setupService: (sb) => sb.disableChecks(),
    serviceProperty: 'checksDisabled',
    serviceQueryParameter: 'enable_active_checks',
    filterFunction: filterChecksDisabled,
    filterFlagText: 'with disabled checks',
  },
  filterDowntime: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutDowntime(),
    setupHost: (lcb) => lcb.inDowntime(),
    hostProperty: 'isInDowntime',
    hostQueryParameter: 'downtime_depth',
    setupService: (sb) => sb.inDowntime(),
    serviceProperty: 'isInDowntime',
    serviceQueryParameter: 'downtime_depth',
    filterFunction: filterDowntime,
    filterFlagText: 'within downtime',
  },
};
