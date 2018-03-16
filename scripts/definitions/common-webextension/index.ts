export class WebExtensionBrowser {
    public tabs: Tabs;
    public runtime: Runtime;
    public storage: BrowserStorage;
    public browserAction: BrowserAction;
    public windows: Windows;
    public extension: Extension;
    public alarms: Alarms;
}

interface WindowsCreateOptions {
    url?: string;
}

interface Alarms {
    onAlarm: RuntimeEvent;
    create(name: string, alarmInfo: AlarmInfo): void;
    clear(name: string): void;
}

interface AlarmInfo {
    when?: number;
    delayInMinutes?: number;
    periodInMinutes?: number;
}

interface Extension {
    getBackgroundPage(): Window;
}

interface Windows {
    create(options: WindowsCreateOptions): void;
}

interface Tabs {
    create(params: { url?: string }): void;
}

interface Runtime {
    onInstalled: InstalledEvent;
    onConnect: RuntimeEvent;
    connect(
        extensionId?: string,
        connectInfo?: { name?: string, includeTlsChannelId?: boolean }
    ): Port;
    openOptionsPage(): void;
    getURL(url: string): string;
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

interface RuntimeEvent {
    addListener(
        callback: (
            message?: any,
            sender?: any,
            sendResponse?: (response: any) => void
        ) => void): void;
    removeListener(callback: () => void): void;
}

export interface Port {
    onMessage: RuntimeEvent;
    onDisconnect: RuntimeEvent;
    postMessage(message: any): void;
}

interface BrowserStorage {
    local: StorageArea;
}

interface StorageArea {
    get(keys: string | string[]): Promise<any>;
    get(keys: string | string[], callback: (items: any) => void): void;
    set(data: object): Promise<void>;
}

interface BrowserAction {
    setIcon(
        icon: {
            path: { 40?: string, 32?: string, 24?: string, 20?: string, 16?: string }
        }): void;
    setBadgeText(badge: { text: string }): void;
    setBadgeBackgroundColor(details: { color: string }): void;
}
