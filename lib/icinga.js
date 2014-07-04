var Request = require("sdk/request").Request;
var { on, once, off, emit } = require('sdk/event/core');


var statusurl = "";

/* The event transport object */
var target = {emit: function() {}};
var SetEventTransport = function(globaleventtarget) {
    target = globaleventtarget;
}
exports.SetEventTransport = SetEventTransport;


/* The available events */
var EventNames = {};
var SetEventNames = function(en) {
    EventNames = en;
}
exports.SetEventNames = SetEventNames;



var StatusUrlChanged = function(newurl) {
    console.log("StatusUrlChanged");
    statusurl = newurl;
}

exports.StatusUrlChanged = StatusUrlChanged;


var RefreshStatusTriggered = function() {
    if (statusurl == "") {
        console.log("Unconfigured: " + EventNames.Unconfigured)
        emit(target, EventNames.Unconfigured);
        return;
    }
    console.log("RefreshStatus triggered");
    console.log("url: " + statusurl + "?jsonoutput");
    Request({
        url: statusurl + "?jsonoutput",
        //overrideMimeType: "text/plain; charset=utf8",
        onComplete: function(response) {
            if (response.status != 200) {
		console.log(response.text);
            } else {
                for (var headerName in response.headers) {
                    console.log(headerName + " : " + response.headers[headerName]);
                }
                console.log(JSON.stringify(response.json));
            }
        }
    }).get();
}

exports.RefreshStatusTriggered = RefreshStatusTriggered;