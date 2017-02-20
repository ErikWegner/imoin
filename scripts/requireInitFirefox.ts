/// <reference path="definitions/requirejs/index.d.ts" />

import {Firefox} from "./firefox"
import {EnvironmentFactory} from "./IEnvironment";

EnvironmentFactory.registerFactory(() => new Firefox());

requirejs.config({
    skipDataMain: true
});

require(['main'], function (main: any) {
    console.log("all js loaded");
});
