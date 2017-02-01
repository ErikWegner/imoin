/// <reference path="definitions/requirejs/index.d.ts" />
requirejs.config({
    skipDataMain: true
});
require(['main'], function (main) {
    console.log("all js loaded");
});
