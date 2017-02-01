var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("Settings", ["require", "exports"], function (require, exports) {
    "use strict";
    var Settings = (function () {
        function Settings(timerPeriod) {
            if (timerPeriod === void 0) { timerPeriod = 5; }
            this.timerPeriod = timerPeriod;
        }
        return Settings;
    }());
    exports.Settings = Settings;
});
define("IEnvironment", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("AbstractWebExtensionsEnvironment", ["require", "exports"], function (require, exports) {
    "use strict";
    var AbstractWebExtensionsEnvironment = (function () {
        function AbstractWebExtensionsEnvironment() {
        }
        AbstractWebExtensionsEnvironment.prototype.addAlarm = function (webExtension, delay, callback) {
            webExtension.alarms.create("imoin", {
                periodInMinutes: delay
            });
            webExtension.alarms.onAlarm.addListener(function (alarm) {
                callback();
            });
        };
        return AbstractWebExtensionsEnvironment;
    }());
    exports.AbstractWebExtensionsEnvironment = AbstractWebExtensionsEnvironment;
});
define("firefox", ["require", "exports", "AbstractWebExtensionsEnvironment"], function (require, exports, AbstractWebExtensionsEnvironment_1) {
    "use strict";
    var Firefox = (function (_super) {
        __extends(Firefox, _super);
        function Firefox() {
            _super.apply(this, arguments);
        }
        Firefox.prototype.loadSettings = function () {
            return new Promise(function (resolve, reject) {
                var gettingItem = browser.storage.local.get("imoinsettings");
                gettingItem.then(function (settings) {
                    resolve(settings);
                }, function (error) {
                    console.error("Loading settings failed");
                    console.error(error);
                    reject(error);
                });
            });
        };
        Firefox.prototype.initTimer = function (delay, callback) {
            this.addAlarm(browser, delay, callback);
        };
        return Firefox;
    }(AbstractWebExtensionsEnvironment_1.AbstractWebExtensionsEnvironment));
    exports.Firefox = Firefox;
});
define("main", ["require", "exports", "firefox"], function (require, exports, firefox_1) {
    "use strict";
    var e = new firefox_1.Firefox();
    e.loadSettings().then(function (settings) {
        e.initTimer(settings.timerPeriod, function () {
            console.log("Alarm23");
        });
    });
});
