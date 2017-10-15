declare var requirejs: Require;
declare var require: Require;

requirejs.config({
    skipDataMain: true
});

require(['firefox', 'main'], function () {
});
