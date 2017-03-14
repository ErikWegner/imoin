/// <reference path="definitions/requirejs/index.d.ts" />

requirejs.config({
    skipDataMain: true
});

require(['electron', 'main'], function () {
});
