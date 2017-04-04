import { IEnvironment } from "./IEnvironment";
import { Monitor } from "./MonitorData";
import { UICommand } from "./UICommand";
import { Settings } from "./Settings";
import { IconAndBadgetext } from "./IconAndBadgetext";
import Status = Monitor.Status;

export abstract class AbstractEnvironment implements IEnvironment {
    abstract load(url: string, username: string, password: string): Promise<string>;
    abstract post(url: string, data: any, username: string, password: string): Promise<string>;
    abstract debug(o: any): void;
    abstract log(o: any): void;
    abstract error(o: any): void;
    abstract loadSettings(): Promise<Settings>
    abstract initTimer(delay: number, callback: () => void): void
    abstract stopTimer(): void
    protected abstract trySendDataToPopup(): void;
    protected abstract openWebPage(url: string): void;
    protected abstract updateIconAndBadgetext(): void;

    protected dataBuffer = Monitor.ErrorMonitorData("Update pending …");
    protected onSettingsChangedCallback: () => void;
    protected onAlarmCallback: () => void;
    private onUICommandCallback: (param: UICommand) => void;

    protected static prepareIconAndBadgetext(data: Monitor.MonitorData): IconAndBadgetext {
        let path = "";
        let badgeText: string = "";
        let badgeColor = "";
        switch (data.state) {
            case Status.GREEN:
                path = "ok";
                /*badgeText = "" + data.hostup;*/
                badgeColor = "#83b225";
                break;
            case Status.YELLOW:
                path = "warn";
                badgeText = "" + data.servicewarnings;
                badgeColor = "#b29a25";
                break;
            case Status.RED:
                path = "err";
                badgeText = "" + (data.hosterrors + data.servicewarnings + data.serviceerrors);
                badgeColor = "#b25425";
                break;
        }
        let iAndB = new IconAndBadgetext();
        iAndB.badgeText = badgeText;
        iAndB.badgeColor = badgeColor;
        iAndB.badgeIcon = {
            "16": "icons/icon-16" + path + ".png",
            "24": "icons/icon-32" + path + ".png",
            "32": "icons/icon-32" + path + ".png"
        };
        return iAndB;
    }

    protected handleAlarm() {
        this.debug("Periodic alarm");
        if (this.onAlarmCallback != null) {
            this.onAlarmCallback();
        }
    }

    public onSettingsChanged(callback: () => void) {
        this.onSettingsChangedCallback = callback
    }

    public onUICommand(callback: (param: UICommand) => void): void {
        this.onUICommandCallback = callback;
    }

    protected emitUICommand(param: UICommand) {
        if (this.onUICommandCallback != null) {
            this.onUICommandCallback(param);
        }
    }

    protected notifySettingsChanged() {
        if (this.onSettingsChangedCallback != null) {
            this.onSettingsChangedCallback();
        }
    }

    public displayStatus(data: Monitor.MonitorData): void {
        this.debug("displayStatus");
        this.dataBuffer = data;
        this.updateIconAndBadgetext();
        this.trySendDataToPopup();
    }

    protected handleMessage(request: any, sender?: any, sendResponse?: (message: any) => void) {
        const command = request.command || "";

        if (command == "triggerRefresh") {
            this.handleAlarm();
        }

        if (command == "triggerOpenPage") {
            if (typeof (request.url) !== "undefined" && request.url != "") {
                this.openWebPage(request.url)
            }
        }

        if (command == "triggerCmdExec") {
            let c = new UICommand;
            c.command = request.remoteCommand;
            c.hostname = request.hostname;
            c.servicename = request.servicename;
        }

        if (command == "SettingsChanged") {
            this.notifySettingsChanged();
        }
    }
}