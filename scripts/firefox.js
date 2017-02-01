var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./AbstractWebExtensionsEnvironment"], function (require, exports, AbstractWebExtensionsEnvironment_1) {
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
    exports.firefox = Firefox;
});
