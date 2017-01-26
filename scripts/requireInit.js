var baseUrl = browser.extension.getURL("/");
requirejs.config({
    config: {
        text: {
            useXhr: function (url, protocol, hostname, port) {
                return true;
            }
        }
    },
    skipDataMain: true,
    baseUrl: baseUrl,
    paths: {
        "./firefox": "scripts/firefox",
        "app": "scripts/main"
    }
});
require(['app'], function (app) {
    console.log("all js loaded");
});
