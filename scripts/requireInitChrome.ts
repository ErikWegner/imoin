/// <reference path="definitions/requirejs/index.d.ts" />

import {EnvironmentFactory} from "./IEnvironment";
import {Chrome} from "./chrome";

EnvironmentFactory.registerFactory(() => new Chrome());

requirejs.config({
    skipDataMain: true
});

require(['main'], function (main: any) {
    console.log("all js loaded");
});
