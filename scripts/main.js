var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var browser;
var AbstractEnvironment = (function () {
    function AbstractEnvironment() {
    }
    AbstractEnvironment.prototype.addAlarm = function (webExtension, delay, callback) {
        webExtension.alarms.create("imoin", {
            periodInMinutes: delay
        });
        webExtension.alarms.onAlarm.addListener(function (alarm) {
            callback();
        });
    };
    return AbstractEnvironment;
}());
var Firefox = (function (_super) {
    __extends(Firefox, _super);
    function Firefox() {
        _super.apply(this, arguments);
    }
    Firefox.prototype.initTimer = function (delay, callback) {
        this.addAlarm(browser, delay, callback);
    };
    return Firefox;
}(AbstractEnvironment));
var e = new Firefox();
e.initTimer(0.2, function () {
    console.log("Alarm2");
});
