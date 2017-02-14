/// <reference path="../es6-promise/index.d.ts" />

declare namespace Browser {
    class Browser {
        runtime: Runtime
        storage: BrowserStorage
        browserAction: BrowserAction
    }

    class Runtime {
        onConnect: RuntimeEvent
    }

    class MessageSender {

    }

    class RuntimeEvent {
        addListener(callback: (message?: any, sender?: MessageSender, sendResponse?: (response: any) => void) => void): void;
    }

    export class Port {
        onMessage: RuntimeEvent
        onDisconnect: RuntimeEvent
        postMessage(message: any): void
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
    }
}

declare var browser: Browser.Browser;