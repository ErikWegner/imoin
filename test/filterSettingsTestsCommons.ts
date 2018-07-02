import { FilterSettingsBuilder } from './abstractHelpers/FilterSettingsBuilder';
import { HostBuilder } from './abstractHelpers/HostBuilder';
import { Monitor } from '../scripts/monitors';
import { ServiceBuilder } from './abstractHelpers/ServiceBuilder';

export const filterSettingsTests: {
  [filterName: string]: {
    setupFilterSettingsBuilder: (fsb: FilterSettingsBuilder) => void,
    setupHost: (lcb: HostBuilder) => void,
    hostProperty: keyof Monitor.Host,
    hostQueryParameter: string,
    setupService: (sb: ServiceBuilder) => void,
    serviceProperty: keyof Monitor.Service,
    serviceQueryParameter: string,
  }
} = {
  hasBeenAcknowledged: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutAcknowledged(),
    setupHost: (lcb) => lcb.HasBeenAcknowledged(),
    hostProperty: 'hasBeenAcknowledged',
    hostQueryParameter: 'acknowledgement',
    setupService: (sb) => sb.hasBeenAcknowledged(),
    serviceProperty: 'hasBeenAcknowledged',
    serviceQueryParameter: 'acknowledgement'
  },
  softState: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutSoftStates(),
    setupHost: (lcb) => lcb.softState(),
    hostProperty: 'isInSoftState',
    hostQueryParameter: 'state_type',
    setupService: (sb) => sb.inSoftState(),
    serviceProperty: 'isInSoftState',
    serviceQueryParameter: 'state_type',
  },
  notificationDisabled: {
    setupFilterSettingsBuilder: (sb) => sb.filterOutNotificationDisabled(),
    setupHost: (lcb) => lcb.disableNotifications(),
    hostProperty: 'notificationsDisabled',
    hostQueryParameter: 'enable_notifications',
    setupService: (sb) => sb.notificationsDisabled(),
    serviceProperty: 'notificationsDisabled',
    serviceQueryParameter: 'enable_notifications',
  },
};