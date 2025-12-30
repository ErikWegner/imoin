import { IconAndBadgetext } from './IconAndBadgetext.js';
import { IPanelMonitorData } from './IPanelMonitorData.js';
import { MonitorData, PanelDataV3 } from './monitors/index.js';
import { IcingaOptionsVersion, Settings, Sound } from './Settings.js';
import { UICommand } from './UICommand.js';

export interface AlarmSetupInformation {
  alarmName: string;
  timerPeriod: number;
}

export interface V3Instance {
  instancelabel: string;
  timerPeriod: number;
  icingaversion: IcingaOptionsVersion;
  url: string;
  username: string;
  password: string;
}

export interface V3Settings {
  instances: V3Instance[];
  fontsize: number;
  inlineresults: boolean;
  sounds: Record<string, Sound>;
}

export interface V3Loader {
  /** Load a resource */
  load(url: string, username: string, password: string): Promise<string>;
}

/** Interface for environment abstraction */
export interface V3Environment {
  /** Send a message to the panel */
  sendPanelMessage(msg: UICommand): void;
  /** Add another period alarm trigger */
  createAlarm(alarmName: string, periodInMinutes: number): Promise<void>; // TODO: remove if not needed
  /** Load settings */
  getSettings(): Promise<V3Settings>;
  /** Open the settings page */
  openSettingspage(): void;
  savePanelData(instancesData: PanelDataV3): Promise<void>;
  getPanelData(): Promise<PanelDataV3>;
  ensureAlarms(
    alarms: AlarmSetupInformation[],
    options: { clearExistingAlarms: boolean },
  ): Promise<void>;
  setOverallStatus(overallStatus: IconAndBadgetext): void;
}

/** @deprecated */
export interface IEnvironment {
  /**
   * Execute the callback at every delay minutes
   *
   * @argument index Index when using multiple instances
   * @argument callback function to run after each period
   * @argument delay waiting period in minutes
   */
  initTimer(index: number, delay: number, callback: () => void): void;

  /** Disable the timer */
  stopTimer(index: number): void;

  /** Execute the callback when the settings have changed */
  onSettingsChanged(callback: () => void): void;

  /** Get the settigs from the storage */
  loadSettings(): Promise<Settings>;

  /** Update the UI to reflect the updated status data */
  displayStatus(index: number, data: MonitorData): void;

  /** Load a resource */
  load(url: string, username: string, password: string): Promise<string>;

  /** Send a post request */
  post(
    url: string,
    data: unknown,
    username: string,
    password: string,
  ): Promise<string>;

  /** UICommand for the monitor instance */
  onUICommand(index: number, callback: (param: UICommand) => void): void;

  /** Register a monitor instance */
  registerMonitorInstance(index: number, monitor: IPanelMonitorData): void;

  /** Called once after install or browser restarts */
  onStartup(handler: () => void): void;

  /** Called after reactivating the environment from inactivity */
  registerAlarmHandler(): void;
}
