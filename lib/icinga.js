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
    console.log("url: " + statusurl + "?host=all&style=hostservicedetail&jsonoutput");
    Request({
        url: statusurl + "?host=all&style=hostservicedetail&jsonoutput",
        //overrideMimeType: "text/plain; charset=utf8",
        onComplete: function(response) {
            if (response.status != 200) {
		console.log(response.text);
		emit(target, EventNames.GenericError, response.text);
            } else {
                //for (var headerName in response.headers) {
                    //console.log(headerName + " : " + response.headers[headerName]);
                //}
                //console.log(JSON.stringify(response.json));
		console.log("emit ProcessResponse");
		emit(target, EventNames.ProcessResponse, response.json);
            }
        }
    }).get();
}

exports.RefreshStatusTriggered = RefreshStatusTriggered;


var ProcessResponse = function(response) {
    console.log("ProcessResponse");
    var hoststatus, servicestatus;
    var status = {
	    totalhosts: 0,
	    totalservices: 0,
	    hostup: 0,
	    hosterrors: 0,
	    serviceok: 0,
	    serviceerrors: 0,
	    servicewarnings: 0,
	    updatetime: (new Date()).toISOString()
	};
    if (response != null) {
	if (response.status) {
	    if (response.status.host_status) {
		for (var hostindex in response.status.host_status) {
		    hoststatus = response.status.host_status[hostindex];
		    if (hoststatus.status !== "UP") {
			status.hosterrors++;
		    } else {
			status.hostup++;
		    }
		}
		status.totalhosts = response.status.host_status.length;
	    }
	    
	    if (response.status.service_status) {
		for (var serviceindex in response.status.service_status) {
		    servicestatus = response.status.service_status[serviceindex];
		    if (servicestatus.status !== "OK") {
			if (servicestatus.status === "WARN") {
			    status.servicewarnings++;
			} else {
			    status.serviceerrors++;
			} 
		    } else {
			status.serviceok++;
		    }
		}
		
		status.totalservices = response.status.service_status.length;
	    }
	}
    }
    
    emit(target, EventNames.StatusUpdate, status);
}

exports.ProcessResponse = ProcessResponse;
