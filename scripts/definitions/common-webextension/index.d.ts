declare namespace WebExtension {
    class WebExtensionBrowser {
        tabs: Tabs;
        runtime: Runtime;
        storage: BrowserStorage;
        browserAction: BrowserAction;
        windows: Windows;
        extension: Extension;
        alarms: Alarms;
    }

    type WindowsCreateOptions = {
        url?: string
    }

    type Alarms = {
        onAlarm: RuntimeEvent;
        create(name: string, alarmInfo: AlarmInfo): void;
        clear(name: string): void;
    }

    type AlarmInfo = {
        when?: number;
        delayInMinutes?: number;
        periodInMinutes?: number;
    }

    class Extension {
        getBackgroundPage(): Window;
    }

    class Windows {
        create(options: WindowsCreateOptions): void
    }

    class Tabs {
        create(params: {url?: string}): void
    }

    class Runtime {
        onInstalled: InstalledEvent;
        onConnect: RuntimeEvent;
        connect(extensionId?: string, connectInfo? : {name?: string, includeTlsChannelId?: boolean}): Port;
        openOptionsPage(): void;
        getURL(url: string): string;
    }

    class MessageSender {

    }

    interface InstalledEventDetails {
        id? : string;
        previousVersion?: string;
        reason: string;
        temporary: boolean;
    }

    class InstalledEvent {
        addListener(callback: (details: InstalledEventDetails) => void): void;
    }

    class RuntimeEvent {
        addListener(callback: (message?: any, sender?: MessageSender, sendResponse?: (response: any) => void) => void): void;
        removeListener(callback: () => void): void;
    }

    export class Port {
        onMessage: RuntimeEvent;
        onDisconnect: RuntimeEvent;
        postMessage(message: any): void;
    }

    class BrowserStorage {
        local: StorageArea
    }

    class StorageArea {
        get(keys: string | Array<string>): Promise<any>;
        get(keys: string | Array<string>, callback: (items: any) => void): void;
    }

    class BrowserAction {
        setIcon(icon: {path: {32: string, 24?: string, 16: string}}): void
        setBadgeText(badge: {text: string}): void
        setBadgeBackgroundColor(details: {color: string}): void
    }
}
