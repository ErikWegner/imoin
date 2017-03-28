/// <reference path="definitions/node/index.d.ts" />
/// <reference path="definitions/electron/index.d.ts" />

import { EnvironmentFactory } from "./IEnvironment";
import { AbstractEnvironment } from "./AbstractEnvironment";
import { Settings } from "./Settings";
import { Monitor } from "./MonitorData";
import { UICommand } from "./UICommand";
import Electron = require('electron')
const { ipcMain } = require('electron');
import path = require('path')
import url = require('url')


/**
 * Implementation for Electron (Desktop)
 */
export class ElectronApp extends AbstractEnvironment {
    protected updateIconAndBadgetext(): void {
        this.debug("updateIconAndBadgetext");
    }
    protected trySendDataToPopup(): void {
        ipcMain.emit('topanel', this.dataBuffer);
    }
    protected openWebPage(url: string): void {
        throw new Error('Method not implemented.');
    }

    private app = Electron.app
    private tray: Electron.Tray
    private mainWindow: Electron.BrowserWindow
    private cfgWindow: Electron.BrowserWindow
    private isQuitting = false

    constructor() {
        super();
        let i = this;
        this.app.on('ready', function () {
            i.createTrayMenu()
            ipcMain.addListener('frompanel', (data) => {
                i.handleMessage(data);
            })
        });
    }

    initTimer(delay: number, callback: () => void): void {
        // TODO
        this.debug("initTimer");
        this.onAlarmCallback = callback;
        this.handleAlarm();
    }
    stopTimer(): void {
        // TODO
        this.debug("stopTimer");
    }
    onSettingsChanged(callback: () => void): void {
        // TODO
        this.debug("onSettingsChanged");
    }
    loadSettings(): Promise<Settings> {
        return new Promise<Settings>(
            (resolve, reject) => {
                resolve(new Settings(5, "api1", "", "user", "pass"));
                //reject("Not implemented");
            }
        );
    }
    load(url: string, username: string, password: string): Promise<string> {
        // TODO
        return new Promise<String>((resolve, reject) => { });
    }
    post(url: string, data: any, username: string, password: string): Promise<string> {
        // TODO
        return new Promise<String>((resolve, reject) => { });
    }

    debug(o: any): void {
        console.log(o);
    }

    log(o: any): void {
        console.log(o);
    }

    error(o: any): void {
        console.error(o);
    }

    quit(): void {
        this.isQuitting = true;
        this.app.quit();
    }

    createTrayMenu(): void {
        let i = this;
        this.tray = new Electron.Tray(path.join(__dirname, 'icons', 'icon-64.png'));
        const contextMenu = Electron.Menu.buildFromTemplate([
            { label: 'Status', click() { i.showMainWindow(); } },
            { label: 'Configure', click() { i.showCfgWindow(); } },
            { type: 'separator' },
            { label: 'Quit', click() { i.quit() } }
        ]);
        this.tray.setToolTip('Imoin');
        this.tray.setContextMenu(contextMenu);
        this.tray.on('click', () => { i.showMainWindow(); })
    }

    showCfgWindow(): void {
        let i = this;
        if (this.cfgWindow == null) {
            this.cfgWindow = new Electron.BrowserWindow();
            this.cfgWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'html', 'options.html'),
                protocol: 'file:',
                slashes: true
            }))
            this.cfgWindow.on('close', (e: Event) => {
                if (i.isQuitting == false) {
                    e.preventDefault();
                    i.cfgWindow.hide();
                } else {
                    i.cfgWindow = null
                }
            })
        }
        this.cfgWindow.show();
    }

    showMainWindow(): void {
        let i = this;
        if (this.mainWindow == null) {
            this.mainWindow = new Electron.BrowserWindow({ width: 800, height: 600 })
            // Emitted when the window is closed.
            this.mainWindow.on('close', function (e: Event) {
                if (i.isQuitting == false) {
                    e.preventDefault();
                    i.mainWindow.hide();
                } else {
                    // Dereference the window object, usually you would store windows
                    // in an array if your app supports multi windows, this is the time
                    // when you should delete the corresponding element.
                    i.mainWindow = null
                }
            })

            // and load the index.html of the app.
            this.mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'html', 'panel.html'),
                protocol: 'file:',
                slashes: true
            }))
        }

        this.mainWindow.show()
    }
}

EnvironmentFactory.registerFactory(() => new ElectronApp());