/// <reference path="definitions/node/index.d.ts" />
/// <reference path="definitions/electron/index.d.ts" />

import { IEnvironment, EnvironmentFactory } from "./IEnvironment";
import { Settings } from "./Settings";
import { Monitor } from "./MonitorData";
import { UICommand } from "./UICommand";
import Electron = require('electron')
import path = require('path')

/**
 * Implementation for Electron (Desktop)
 */
export class ElectronApp implements IEnvironment {
    private app = Electron.app
    private tray: Electron.Tray
    private mainWindow: Electron.BrowserWindow

    constructor() {
        let i = this;
        this.app.on('ready', function () {
            i.createTrayMenu()
        });
    }

    initTimer(delay: number, callback: () => void): void {
        // TODO
    }
    stopTimer(): void {
        // TODO
    }
    onSettingsChanged(callback: () => void): void {
        // TODO
    }
    loadSettings(): Promise<Settings> {
        return new Promise<Settings>(
            (resolve, reject) => {
                resolve(new Settings(5, "api1", "", "user", "pass"));
                //reject("Not implemented");
            }
        );
    }
    displayStatus(data: Monitor.MonitorData): void {
        // TODO
    }
    load(url: string, username: string, password: string): Promise<string> {
        // TODO
        return new Promise<String>((resolve, reject) => { });
    }
    post(url: string, data: any, username: string, password: string): Promise<string> {
        // TODO
        return new Promise<String>((resolve, reject) => { });
    }
    onUICommand(callback: (param: UICommand) => void): void {
        // TODO
    }

    debug(o: any): void {
        console.debug(o);
    }

    log(o: any): void {
        console.log(o);
    }

    error(o: any): void {
        console.error(o);
    }

    quit(): void {
        this.app.quit();
    }

    createTrayMenu(): void {
        let i = this;
        this.tray = new Electron.Tray(path.join(__dirname, 'icons', 'icon-64.png'));
        const contextMenu = Electron.Menu.buildFromTemplate([
            { label: 'Item1', type: 'radio' },
            { label: 'Item2', type: 'radio' },
            { type: 'separator' },
            { label: 'Quit', click() { i.quit() } }
        ]);
        this.tray.setToolTip('Imoin');
        this.tray.setContextMenu(contextMenu);
        this.tray.on('click', () => { i.showMainWindow(); })
    }

    showMainWindow(): void {
        let i = this;
        if (this.mainWindow == null) {
            this.mainWindow = new Electron.BrowserWindow({ width: 800, height: 600 })
            // Emitted when the window is closed.
            this.mainWindow.on('close', function (e: Event) {
                e.preventDefault();
                i.mainWindow.hide();
                // Dereference the window object, usually you would store windows
                // in an array if your app supports multi windows, this is the time
                // when you should delete the corresponding element.
                i.mainWindow = null
            })
        }

        this.mainWindow.show()
    }
}

EnvironmentFactory.registerFactory(() => new ElectronApp());