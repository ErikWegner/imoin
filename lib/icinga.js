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
    //console.log("InstanceUrlChanged");
    cgipath = newurl;
    if (cgipath[cgipath.length - 1] !== "/") {
	cgipath += "/";
    }
}

exports.InstanceUrlChanged = InstanceUrlChanged;


var RefreshStatusTriggered = function() {
    var errmsg = "";
    if (cgipath === "" || cgipath === null) {
        //console.log("Unconfigured: " + EventNames.Unconfigured)
        emit(target, EventNames.Unconfigured);
        return;
    }
    //console.log("RefreshStatus triggered");
    //console.log("url: " + cgipath + "status.cgi?host=all&style=hostservicedetail&jsonoutput");
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
		    //console.log("emit ProcessResponse");
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

var Hoststatus = (function () {
    function Hoststatus(hoststatus) {
	// copy attributes from icinga
        this.hostname = hoststatus.host_display_name;
        this.status = hoststatus.status;
	this.information = hoststatus.status_information;
	this.acknowledged = hoststatus.has_been_acknowledged;
	// init array for services
        this.services = [];
    }
    Hoststatus.prototype.AddService = function (servicestatus) {
	//console.log("Add Service");
	this.services.push(servicestatus);
    };
    return Hoststatus;
})();

var ProcessResponse = function(response) {
    //console.log("ProcessResponse");
    var hoststatus, servicestatus;
    var status = {
	    totalhosts: 0,
	    totalservices: 0,
	    hostup: 0,
	    hosterrors: 0,
	    serviceok: 0,
	    serviceerrors: 0,
	    servicewarnings: 0,
	    updatetime: RenderDate(new Date()),
	    details: {}
	};
    if (response != null) {
	if (response.status) {
	    if (response.status.host_status) {
		for (var hostindex in response.status.host_status) {
		    hoststatus = response.status.host_status[hostindex];
		    status.details[hoststatus.host_name] = new Hoststatus(hoststatus);
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
		    var hoststatus = status.details[servicestatus.host_name];
		    hoststatus.AddService(servicestatus);
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

var z = function (num) {
  if ( num < 10 ) {
    num = '0'+num;
  }
  return num;
}

var TriggerCmdExec = function(data) {
    var cmds = {'ack': 33, 'recheck': 96};
    var url = cgipath;
    url += "cmd.cgi";
    var service_query = '';
    if (data.servicename !== "") {
	cmds = {'ack': 34, 'recheck': 7};
	data.servicename = data.servicename.replace(/ /, "+");
        service_query = '&service='+data.servicename;
    }
    
    if (data.command === "ack") {
	emit(target, EventNames.OpenTab, (url+'?cmd_typ='+cmds[data.command]+'&host='+data.hostname+service_query));
    }
    
    if (data.command === "recheck") {
	var t = new Date();
	var time = z(t.getFullYear()) + '-' + z(t.getMonth()+1) + '-' + z(t.getDate()) + '+' + z(t.getHours()) + '%3A' + z(t.getMinutes()) + '%3A' + z(t.getSeconds());
    
	var dataString =
	    'cmd_typ=' +
	    cmds[data.command] +
	    '&cmd_mod=2&host=' +
	    data.hostname +
	    service_query +
	    '&start_time=' +
	    time +
	    '&force_check=on&submit=Commit';
    	try {
	    Request({
		url: url,
		//overrideMimeType: "text/plain; charset=utf8",
		onComplete: function(response) {
		    //console.log("Post complete");
		}
	    }).post();
	} catch(e) {
	    errmsg = e.message || "Error during request.";
	    emit(target, EventNames.GenericError, errmsg);
	}
    }
}

exports.TriggerCmdExec = TriggerCmdExec;
