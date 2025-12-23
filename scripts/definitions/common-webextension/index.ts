import { UICommand } from '../../UICommand.js';

export interface WebExtensionBrowser {
  tabs: Tabs;
  runtime: Runtime;
  storage: BrowserStorage;
  action: BrowserAction;
  windows: Windows;
  alarms: Alarms;
}

interface WindowsCreateOptions {
  url?: string;
}

export interface AlarmEvent {
  name: string;
}

interface Alarms {
  onAlarm: RuntimeEvent<AlarmEvent>;
  create(name: string, alarmInfo: AlarmCreateInfo): Promise<void>;
  clear(name: string): void;
  clearAll(): Promise<boolean>;
  get(name: string): Promise<unknown>;
  getAll(): Promise<Alarm[]>;
}

interface Alarm {
  /** Name of this alarm. */
  name: string;
  /** Time at which this alarm was scheduled to fire, in milliseconds past the epoch (e.g. Date.now() + n). */
  scheduledTime: number;
  /** If not null, the alarm is a repeating alarm and will fire again in periodInMinutes minutes. */
  periodInMinutes: number | null;
}

interface AlarmCreateInfo {
  delayInMinutes?: number;
  periodInMinutes?: number;
}

interface Windows {
  create(options: WindowsCreateOptions): void;
}

declare global {
  interface Window {
    console: Console;
  }
}

interface Tabs {
  create(params: { url?: string }): void;
}

interface Runtime {
  onInstalled: InstalledEvent;
  onConnect: RuntimeEvent<Port>;
  onMessage: RuntimeEvent<never>;
  connect(
    extensionId?: string,
    connectInfo?: { name?: string; includeTlsChannelId?: boolean },
  ): Port;
  openOptionsPage(): void;
  getURL(url: string): string;
  getBackgroundPage(): Window;
  onStartup: {
    addListener(callback: () => void): void;
  };
}

export type OnInstalledReason =
  | 'install'
  | 'update'
  | 'chrome_update'
  | 'browser_update'
  | 'shared_module_update';

export interface InstalledEventDetails {
  id?: string;
  previousVersion?: string;
  reason: OnInstalledReason;
  temporary: boolean;
}

interface InstalledEvent {
  addListener(callback: (details: InstalledEventDetails) => void): void;
}

interface RuntimeEvent<T> {
  addListener(
    callback: (
      message: T,
      sender?: unknown,
      sendResponse?: (response: unknown) => void,
    ) => void,
  ): void;
  removeListener(callback: () => void): void;
}

export interface Port {
  onMessage: RuntimeEvent<UICommand>;
  onDisconnect: RuntimeEvent<UICommand>;
  postMessage(message: UICommand): void;
}

interface BrowserStorage {
  session: StorageArea;
  local: StorageArea;
  sync: StorageArea;
}

interface StorageArea {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  get<T extends object>(defaultValue?: T): Promise<T>;
  get(
    keys: string | string[],
    callback: (items: Record<string, unknown>) => void,
  ): void;
  set(data: object): Promise<void>;
}

interface BrowserAction {
  setIcon(icon: {
    path: { 40?: string; 32?: string; 24?: string; 20?: string; 16?: string };
  }): void;
  setBadgeText(badge: { text: string }): void;
  setBadgeBackgroundColor(details: { color: string }): void;
}
