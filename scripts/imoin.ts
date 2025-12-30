import {
  AlarmEvent,
  InstalledEventDetails,
} from './definitions/common-webextension';
import { BadgeColor, IconAndBadgetext } from './IconAndBadgetext';
import { V3Environment, V3Instance, V3Loader } from './IEnvironment';
import { Logger } from './logger';
import { IcingaApi, MonitorV3, Status } from './monitors';
import { FilterSettings } from './Settings';

export class Imoin {
  private filterSettings: FilterSettings | null = null;

  constructor(
    /** The logger */
    private readonly l: Logger,
    /** Host environmet */
    private readonly h: V3Environment & V3Loader,
  ) {}

  openSettingspage() {
    this.h.openSettingspage();
  }

  async ensureAlarms(options: { clearExistingAlarms: boolean }) {
    const settings = await this.h.getSettings();
    const alarms = (settings?.instances ?? []).map((instance, index) => ({
      alarmName: `i${index + 1}`,
      timerPeriod: instance.timerPeriod,
    }));
    await this.h.ensureAlarms(alarms, options);
  }

  notifySettingsChanged() {
    void this.ensureAlarms({ clearExistingAlarms: true });
  }

  setupAlarms() {
    void this.ensureAlarms({ clearExistingAlarms: false });
  }

  async triggerRefresh() {
    this.l.log('Triggering refresh');
    const settings = await this.h.getSettings();

    let instanceIndex = 0;
    for (const instance of settings?.instances ?? []) {
      this.l.log(`Refreshing instance ${instanceIndex + 1}`);
      const monitor = await this.getMonitor(instance);
      if (monitor) {
        await this.pollAndSaveAndStatusUpdate(instanceIndex, monitor);
      }
      instanceIndex++;
    }

    if (instanceIndex === 0) {
      // No instances configured, nothing to refresh.
      await this.calculateAndShowOverallStatus();
    }
  }

  async alarmEvent(alarm: AlarmEvent) {
    const settings = await this.h.getSettings();
    this.l.debug('Alarm', JSON.stringify(alarm));
    const [, instanceNumberStr] = alarm.name.match(/i(\d+)/) || [];
    if (instanceNumberStr) {
      const instanceNumber = parseInt(instanceNumberStr, 10);
      if (
        instanceNumber > 0 &&
        instanceNumber <= (settings?.instances.length ?? 0)
      ) {
        const instanceIndex = instanceNumber - 1;
        const instance = settings?.instances[instanceIndex];
        if (instance) {
          this.l.log(`Handling alarm for instance ${instanceNumber}`);
          const monitor = await this.getMonitor(instance);
          if (monitor) {
            await this.pollAndSaveAndStatusUpdate(instanceIndex, monitor);
          }
        }
      } else {
        this.l.error(`Invalid instance number: ${instanceNumber}`);
      }
    }
  }

  /**
   * Call the instance for data. Update the local state and send a message to the panel.
   */
  async pollAndSaveAndStatusUpdate(
    /** Zero-based index of the instance */
    instanceIndex: number,
    monitor: MonitorV3,
  ): Promise<void> {
    const monitorData = await monitor.fetchStatusV3(this.h);
    const panelData = await this.loadPanelData();
    panelData.instances[instanceIndex] = monitorData;
    panelData.updatetime = new Date().toISOString();
    await this.h.savePanelData(panelData);
    await this.calculateAndShowOverallStatus();
    this.h.sendPanelMessage({ command: 'UpdatePanelData' });
  }

  getMonitor(instance: V3Instance): Promise<MonitorV3 | null> {
    if (instance.icingaversion === 'api1') {
      return Promise.resolve(new IcingaApi(null, instance, 0));
    }
    this.l.error(`Unsupported Icinga version: ${instance.icingaversion}`);
    return Promise.resolve(null);
  }

  installedEvent(details: InstalledEventDetails): void {
    this.l.debug('Installed', details.reason);
    if (details.reason === 'install') {
      this.l.log('Opening settings page');
      this.h.openSettingspage();
    }
  }

  loadPanelData() {
    return this.h.getPanelData();
  }

  private async calculateAndShowOverallStatus(): Promise<IconAndBadgetext> {
    const iAndB = await this.calculateOverallStatus();
    this.h.setOverallStatus(iAndB);
    return iAndB;
  }

  private async calculateOverallStatus(): Promise<IconAndBadgetext> {
    const badgeIcon = (path: 'err' | 'warn' | 'ok') => ({
      16: 'icons/icon-16' + path + '.png',
      20: 'icons/icon-32' + path + '.png',
      24: 'icons/icon-32' + path + '.png',
      32: 'icons/icon-32' + path + '.png',
      40: 'icons/icon-32' + path + '.png',
    });
    const panelData = await this.loadPanelData();
    // If no instance is configured, set state to 'error'
    if (panelData.instances.length === 0) {
      return {
        overallStatus: Status.RED,
        badgeColor: BadgeColor.RED,
        badgeText: 'X',
        badgeTooltip: 'Open the settings page to configure instances',
        badgeIcon: badgeIcon('err'),
      };
    }

    const filteredState = Status.RED as Status; // TODO: loop over data
    switch (filteredState) {
      case Status.GREEN:
        return {
          overallStatus: filteredState,
          badgeColor: BadgeColor.GREEN,
          badgeText: '',
          badgeTooltip: 'No issues reported',
          badgeIcon: badgeIcon('ok'),
        };
      case Status.YELLOW:
        return {
          overallStatus: filteredState,
          badgeColor: BadgeColor.YELLOW,
          badgeText: '',
          badgeTooltip: 'Warning reported',
          badgeIcon: badgeIcon('warn'),
        };
      default:
        return {
          overallStatus: filteredState,
          badgeColor: BadgeColor.RED,
          badgeText: '',
          badgeTooltip: 'Error reported',
          badgeIcon: badgeIcon('err'),
        };
    }
  }
}
