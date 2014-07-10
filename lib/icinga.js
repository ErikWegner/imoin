var Request = require("sdk/request").Request;
var { on, once, off, emit } = require('sdk/event/core');


var cgipath = "";

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



var InstanceUrlChanged = function(newurl) {
    console.log("InstanceUrlChanged");
    cgipath = newurl;
    if (cgipath[cgipath.length - 1] !== "/") {
	cgipath += "/";
    }
}

exports.InstanceUrlChanged = InstanceUrlChanged;


var RefreshStatusTriggered = function() {
    var errmsg = "";
    if (cgipath === "" || cgipath === null) {
        console.log("Unconfigured: " + EventNames.Unconfigured)
        emit(target, EventNames.Unconfigured);
        return;
    }
    console.log("RefreshStatus triggered");
    console.log("url: " + cgipath + "status.cgi?host=all&style=hostservicedetail&jsonoutput");
    try {
	Request({
	    url: cgipath + "status.cgi?host=all&style=hostservicedetail&jsonoutput",
	    //overrideMimeType: "text/plain; charset=utf8",
	    onComplete: function(response) {
		if (response.status != 200) {
		    errmsg = response.text;
		    if (errmsg === "" || errmsg === null) {
			errmsg = "No response. Try to open <a href=\"" + url + "/status.cgi\">" + url + "/status.cgi</a> in your browser.";
		    }
		    emit(target, EventNames.GenericError, errmsg);
		} else {
		    console.log("emit ProcessResponse");
		    emit(target, EventNames.ProcessResponse, response.json);
		}
	    }
	}).get();
    } catch(e) {
	errmsg = e.message || "Error during request.";
	emit(target, EventNames.GenericError, errmsg);
    }
    
}

exports.RefreshStatusTriggered = RefreshStatusTriggered;

var RenderDate = function (indate) {
    var s = "";
    var s00 = function(s) {
	var r = s.toString();
	return (r.length < 2 ? "0" + r : r);
    }
    
    return indate.getFullYear() + "-" + s00(indate.getMonth()+1) + "-" + s00(indate.getDate()) + " " + s00(indate.getHours()) + ":" + s00(indate.getMinutes()) + ":" + s00(indate.getSeconds());
}
console.log(RenderDate(new Date));


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
	    updatetime: RenderDate(new Date())
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
			if (servicestatus.status === "WARNING") {
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
