declare var requirejs: Require;
declare var require: Require;

requirejs.config({
    skipDataMain: true
});

require(['chrome', 'main'], function () {
});
