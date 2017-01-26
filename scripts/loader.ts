/// <reference path="definitions/requirejs/index.d.ts" />

require.load = function(context, moduleName, url) {

    var xhr = new XMLHttpRequest(),
        evalResponseText = function(xhr: XMLHttpRequest) {
            eval(xhr.responseText);
            context.completeLoad(moduleName);

        };

    xhr.open("GET", url, true);
    xhr.onreadystatechange = function(e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            evalResponseText.call(window, xhr);
        }
    };
    xhr.send(null);


};