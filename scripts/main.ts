import {IEnvironment} from "./IEnvironment";
import {Firefox} from "./firefox";

/**
 * Connecting all pieces together
 */
var e: IEnvironment = new Firefox();

e.loadSettings().then((settings) => {
    e.initTimer(settings.timerPeriod, function () {
        console.log("Alarm23");
    })
});
