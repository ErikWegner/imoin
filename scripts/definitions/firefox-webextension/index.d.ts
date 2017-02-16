/// <reference path="../es6-promise/index.d.ts" />

declare namespace Browser {
    class Browser {
        tabs: Tabs;
        runtime: Runtime;
        storage: BrowserStorage;
        browserAction: BrowserAction;
    }

    class Tabs {
        create(params: {url?: string}): void
    }

    class Runtime {
        onConnect: RuntimeEvent;
        connect(extensionId?: string, connectInfo? : {name?: string, includeTlsChannelId?: boolean}): Port
    }

    class MessageSender {

    }

    class RuntimeEvent {
        addListener(callback: (message?: any, sender?: MessageSender, sendResponse?: (response: any) => void) => void): void;
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
        get(keys: string | Array<string>): Promise<any>
    }

    class BrowserAction {
        setIcon(icon: {path: {32: string, 16: string}}): void
        setBadgeText(badge: {text: string}): void
        setBadgeBackgroundColor(details: {color: string}): void
    }
}

declare const browser: Browser.Browser;