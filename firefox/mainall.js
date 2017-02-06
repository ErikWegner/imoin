var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("MonitorData", ["require", "exports"], function (require, exports) {
    "use strict";
    var Monitor;
    (function (Monitor) {
        var Status;
        (function (Status) {
            Status[Status["GREEN"] = 0] = "GREEN";
            Status[Status["YELLOW"] = 1] = "YELLOW";
            Status[Status["RED"] = 2] = "RED";
        })(Status = Monitor.Status || (Monitor.Status = {}));
        var Service = (function () {
            function Service(name) {
                this.name = name;
            }
            return Service;
        }());
        Monitor.Service = Service;
        var Host = (function () {
            function Host(name) {
                this.name = name;
                this.services = [];
            }
            Host.prototype.addService = function (service) {
                this.services.push(service);
            };
            return Host;
        }());
        Monitor.Host = Host;
        var MonitorData = (function () {
            function MonitorData(status) {
                this.status = status;
            }
            return MonitorData;
        }());
        Monitor.MonitorData = MonitorData;
    })(Monitor = exports.Monitor || (exports.Monitor = {}));
});
define("IMonitor", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("Settings", ["require", "exports"], function (require, exports) {
    "use strict";
    var Settings = (function () {
        function Settings(timerPeriod, icingaversion) {
            if (timerPeriod === void 0) { timerPeriod = 5; }
            this.timerPeriod = timerPeriod;
            this.icingaversion = icingaversion;
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
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Firefox.prototype.displayStatus = function (data) {
            console.log(data);
        };
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
define("AbstractMonitor", ["require", "exports"], function (require, exports) {
    "use strict";
    var AbstractMonitor = (function () {
        function AbstractMonitor() {
        }
        return AbstractMonitor;
    }());
    exports.AbstractMonitor = AbstractMonitor;
});
define("icingaapi", ["require", "exports", "AbstractMonitor", "MonitorData"], function (require, exports, AbstractMonitor_1, MonitorData_1) {
    "use strict";
    var Status = MonitorData_1.Monitor.Status;
    var IcingaApi = (function (_super) {
        __extends(IcingaApi, _super);
        function IcingaApi() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        IcingaApi.prototype.fetchStatus = function () {
            return new Promise(function (resolve, reject) {
                resolve(new MonitorData_1.Monitor.MonitorData(Status.RED));
            });
        };
        return IcingaApi;
    }(AbstractMonitor_1.AbstractMonitor));
    exports.IcingaApi = IcingaApi;
});
define("main", ["require", "exports", "firefox", "icingaapi"], function (require, exports, firefox_1, icingaapi_1) {
    "use strict";
    function resolveMonitor(settings) {
        if (settings.icingaversion == "api1") {
            return new icingaapi_1.IcingaApi();
        }
        return null;
    }
    var e = new firefox_1.Firefox();
    e.loadSettings().then(function (settings) {
        var monitor = resolveMonitor(settings);
        e.initTimer(settings.timerPeriod, function () {
            monitor.fetchStatus().then(function (status) {
                e.displayStatus(status);
            });
        });
    });
});
