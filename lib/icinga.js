var Request = require("sdk/request").Request;
var base64 = require("sdk/base64");

var { on, once, off, emit } = require('sdk/event/core');


var cgipath = "";
var hostgroup = "";
var headers = {};

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

var HostgroupChanged = function(newhostgroup) {
    hostgroup = newhostgroup;
}
exports.HostgroupChanged= HostgroupChanged;

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
    var requesturl = cgipath + "status.cgi?host=all&style=hostservicedetail&jsonoutput";
    if (hostgroup) { requesturl += "&hostgroup=" + hostgroup; }
    try {
	Request({
	    url: requesturl,
	    headers: headers,
	    //overrideMimeType: "text/plain; charset=utf8",
	    onComplete: function(response) {
		if (response.status != 200) {
		    errmsg = response.text;
		    if (errmsg === "" || errmsg === null) {
			errmsg = "No response. Try to open " + cgipath + "/status.cgi in your browser.";
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

function Hoststatus() {
    return {
        hostname: "",
        status: "",
	information: "",
	acknowledged: false,
	hostlink: "",
	// init array for services
        services: []
    };
}
function Hoststatus_Fill_1_6(target, icingahoststatus) {
    // copy attributes from icinga
    target.hostname = icingahoststatus.host_display_name;
    target.status = icingahoststatus.status;
    target.information = icingahoststatus.status_information;
    target.acknowledged = icingahoststatus.has_been_acknowledged;
    target.hostlink = cgipath + "extinfo.cgi?type=1&host=" + icingahoststatus.host_name;
}
function Hoststatus_Fill_1_10(target, icingahoststatus) {
    // copy attributes from icinga
    target.hostname = icingahoststatus.host_display_name;
    target.status = icingahoststatus.status;
    target.information = icingahoststatus.status_information;
    target.acknowledged = icingahoststatus.has_been_acknowledged;
    target.hostlink = cgipath + "extinfo.cgi?type=1&host=" + icingahoststatus.host_name;
}
function Hoststatus_AddService_1_10(target, icingaservicestatus) {
    icingaservicestatus.servicelink = cgipath + "extinfo.cgi?type=2&host=" + icingaservicestatus.host_name + "&service=" + icingaservicestatus.service_description; 
    target.services.push(icingaservicestatus);
};

var ProcessResponse = function(response) {
    var status = {
        hostgroupinfo: "",
	    totalhosts: 0,
	    totalservices: 0,
	    hostup: 0,
	    hosterrors: 0,
	    serviceok: 0,
	    serviceerrors: 0,
	    servicewarnings: 0,
	    updatetime: RenderDate(new Date()),
	    details: { }
	};
    if (response == null || typeof response !== "object") {
	errmsg = "Response is null.";
	emit(target, EventNames.GenericError, errmsg);
	return;
    }
    
    if (hostgroup) {status.hostgroupinfo = "(" + hostgroup + ")"; }
    
    // process different icinga versions
    if (response.cgi_json_version) {
	var version_parts = response.cgi_json_version.split(".");
	if (version_parts.length >= 2) {
	    var major_version = parseInt(version_parts[0]);
	    var minor_version = parseInt(version_parts[1]);
        if ( major_version === 1) {
            if (minor_version >= 10) { ProcessResponse_1_10(response, status); }
            if (minor_version === 6) { ProcessResponse_1_6(response, status); }
	    }
	}
    }
    
    emit(target, EventNames.StatusUpdate, status);
}

var ProcessResponse_1_6 = function(response, status) {
    var servicestatus, hso, lasthostname = "";
    if (response != null) {
	if (response.status) {
	    if (response.status.host_status) {
		for (var index in response.status.host_status) {
		    servicestatus = response.status.host_status[index];
		    
		    if (lasthostname !== servicestatus.host) {
			hso = Hoststatus();
			Hoststatus_Fill_1_6(hso, servicestatus);
			lasthostname = servicestatus.host;
			status.details[hso.hostname] = hso;
			if (hso.status !== "UP") {
			    status.hosterrors++;
			} else {
			    status.hostup++;
			}
			status.totalhosts++;
		    }
		    
		    
		    
		}
		
	    }
	}
    }
}

var ProcessResponse_1_10 = function(response, status) {
    var hoststatus, servicestatus, hso;
    
    function processHoststatus(hoststatus) {    
	hso = Hoststatus();
 	Hoststatus_Fill_1_10(hso, hoststatus);
	status.details[hso.hostname] = hso;
	if (hso.status !== "UP") {
	    status.hosterrors++;
	} else {
	    status.hostup++;
	}
    }
    
    function processServicestatus(servicestatus) {
	var hoststatus = status.details[servicestatus.host_name];
	Hoststatus_AddService_1_10(hoststatus, servicestatus);
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
    
    if (response != null) {
	if (response.status) {
	    if (response.status.host_status) {
		response.status.host_status.forEach(processHoststatus);
		status.totalhosts = response.status.host_status.length;
	    }
	    
	    if (response.status.service_status) {
		response.status.service_status.forEach(processServicestatus);
		status.totalservices = response.status.service_status.length;
	    }
	}
    }
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
    var cmdType = "host";
    var cmdFor = data.hostname;
    
    if (data.servicename !== "") {
	cmds = {'ack': 34, 'recheck': 7};
	data.servicename = data.servicename.replace(/ /, "+");
        service_query = '&service='+data.servicename;
	cmdType = "hostservice";
	cmdFor += "^" + data.servicename;
    }
    
    if (data.command === "ack") {
        emit(target, EventNames.OpenTab, (url+'?cmd_typ='+cmds[data.command]+'&host='+data.hostname+service_query));
    }
    
    if (data.command === "recheck") {
        emit(target, EventNames.OpenTab, (url+'?cmd_typ='+cmds[data.command]+'&host='+data.hostname+service_query+'&force_check'));
    }
}

exports.TriggerCmdExec = TriggerCmdExec;

var AuthenticationData = function (data) {
    switch (data.authtype) {
	case 0:
	    delete(headers["Authorization"]);
	    break;
	case 1:
	    //console.log("Auth: " + data.username + ":" + data.password);
	    headers["Authorization"] = "Basic " + base64.encode(""+data.username + ":" + data.password);
	    break;
    }
}
exports.AuthenticationData = AuthenticationData;
