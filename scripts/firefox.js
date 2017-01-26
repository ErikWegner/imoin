define(["require", "exports"], function (require, exports) {
    "use strict";
    var Firefox = (function () {
        function Firefox() {
        }
        Firefox.prototype.initAlarmAndCallback = function (delay, callback) {
            browser.alarms.create("imoin", {
                delayInMinutes: delay
            });
            browser.alarms.onAlarm.addListener(function (alarm) {
                callback();
            });
        };
        return Firefox;
    }());
    exports.Firefox = Firefox;
});
