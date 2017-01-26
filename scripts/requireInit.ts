declare var browser: any

var baseUrl=browser.extension.getURL("/");
requirejs.config({
    config: {
        text: {
            useXhr: function (url: string, protocol: string, hostname: string, port: number) {
                // allow cross-domain requests
                // remote server allows CORS
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

require(['app'], function (app: any) {
    console.log("all js loaded");//not working
});
