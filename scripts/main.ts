var browser: any

interface IEnvironment {
    initTimer(delay: number, callback: () => void): void
}

abstract class AbstractEnvironment implements IEnvironment {
    abstract initTimer(delay: number, callback: () => void): void

    addAlarm(webExtension: any, delay: number, callback: () => void): void {
        webExtension.alarms.create(
            "imoin",
            {
                periodInMinutes: delay
            }
        )
        webExtension.alarms.onAlarm.addListener((alarm: any) => {
            callback();
        })

    }
}

class Firefox extends AbstractEnvironment {

    initTimer(delay: number, callback: () => void): void {
        this.addAlarm(browser, delay, callback);
    }

}

var e: IEnvironment = new Firefox()

e.initTimer(0.2, function () {
    console.log("Alarm2")
})
