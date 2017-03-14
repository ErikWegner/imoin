import { IEnvironment, EnvironmentFactory } from "./IEnvironment";
import { Settings } from "./Settings";
import { Monitor } from "./MonitorData";
import { UICommand } from "./UICommand";

/**
 * Implementation for Electron (Desktop)
 */
export class Electron implements IEnvironment {
    initTimer(delay: number, callback: () => void): void {
        throw new Error('Method not implemented.');
    }
    stopTimer(): void {
        throw new Error('Method not implemented.');
    }
    onSettingsChanged(callback: () => void): void {
        throw new Error('Method not implemented.');
    }
    loadSettings(): Promise<Settings> {
        return new Promise<Settings>(
            (resolve, reject) => {
                //resolve(new Settings(5, "api1", "", "user", "pass"));
                reject("Not implemented");
            }
        );
    }
    displayStatus(data: Monitor.MonitorData): void {
        throw new Error('Method not implemented.');
    }
    load(url: string, username: string, password: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    post(url: string, data: any, username: string, password: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    onUICommand(callback: (param: UICommand) => void): void {
        throw new Error('Method not implemented.');
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
}

EnvironmentFactory.registerFactory(() => new Electron());