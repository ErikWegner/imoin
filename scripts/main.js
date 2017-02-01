define(["require", "exports", "./firefox"], function (require, exports, firefox_1) {
    "use strict";
    var e = new firefox_1.Firefox();
    e.loadSettings().then(function (settings) {
        e.initTimer(settings.timerPeriod, function () {
            console.log("Alarm23");
        });
    });
});
