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

interface AlarmEvent {
  name: string;
}

interface Alarms {
  onAlarm: RuntimeEvent<AlarmEvent>;
  create(name: string, alarmInfo: AlarmInfo): void;
  clear(name: string): void;
}

interface AlarmInfo {
  when?: number;
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
  connect(
    extensionId?: string,
    connectInfo?: { name?: string; includeTlsChannelId?: boolean }
  ): Port;
  openOptionsPage(): void;
  getURL(url: string): string;
  getBackgroundPage(): Window;
}

interface InstalledEventDetails {
  id?: string;
  previousVersion?: string;
  reason: string;
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
      sendResponse?: (response: unknown) => void
    ) => void
  ): void;
  removeListener(callback: () => void): void;
}

export interface Port {
  onMessage: RuntimeEvent<UICommand>;
  onDisconnect: RuntimeEvent<UICommand>;
  postMessage(message: UICommand): void;
}

interface BrowserStorage {
  local: StorageArea;
}

interface StorageArea {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  get(
    keys: string | string[],
    callback: (items: Record<string, unknown>) => void
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
