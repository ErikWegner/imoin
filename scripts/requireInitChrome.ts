/// <reference path="definitions/requirejs/index.d.ts" />

requirejs.config({
    skipDataMain: true
});

require(['chrome', 'main'], function () {
});
