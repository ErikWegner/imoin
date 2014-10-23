var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var sp = require("sdk/simple-prefs");
var prefs = sp.prefs;
var timers = require("sdk/timers");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var passwords = require("sdk/passwords");

var button = ToggleButton({
  id: "imoin",
  label: "imoin",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

var panel = panels.Panel({
  width: 640,
  height: 570,
  contentURL: self.data.url("panel.html"),
  onHide: handleHide,
  contentScriptFile: [
        data.url("zepto.js"),
        data.url("underscore.js"),
	data.url("panel.js")
  ]
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
    panel.port.emit("show");
  }
}

function handleHide() {
  button.state('window', {checked: false});
}

var { on, once, off, emit } = require('sdk/event/core');
var target = { name: 'imointarget' };
var EventNames = {
    InstanceUrlChanged: "InstanceUrlChanged",
    HostgroupChanged: "HostgroupChanged",
    QueryStatus: "QueryStatus",
    Unconfigured: "Unconfigured",
    GenericError: "GenericError",
    ProcessResponse: "ProcessResponse",
    StatusUpdate: "StatusUpdate",
    TriggerRefresh: "TriggerRefresh",
    OpenTab: "OpenTab",
    AuthenticationData: "AuthenticationData"
};

var icinga = require("./icinga");
icinga.SetEventTransport(target);
icinga.SetEventNames(EventNames);


var ShowNormalButtonIcon = function() {
  button.icon = {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  }  
}

var ShowYellowButtonIcon = function() {
  //console.log("Show red button icon");
  button.icon = {
    "16": "./icon-16warn.png",
    "32": "./icon-32warn.png",
    "64": "./icon-64warn.png"
  }
}

var ShowRedButtonIcon = function() {
  //console.log("Show red button icon");
  button.icon = {
    "16": "./icon-16err.png",
    "32": "./icon-32err.png",
    "64": "./icon-64err.png"
  }
}

var ProcessStatusUpdate = function(status) {
  //console.log("ProcessStatusUpdate");
  //console.log(status);
  if (status.hosterrors > 0 || status.serviceerrors > 0) {
    ShowRedButtonIcon();
  } else if (status.servicewarnings > 0) {
    ShowYellowButtonIcon();
  } else {
    ShowNormalButtonIcon();
  }
  panel.port.emit("ProcessStatusUpdate", status)
}

var GenericError = function(message) {
  ShowRedButtonIcon();
  panel.port.emit("GenericError", message);
}

var Unconfigured = function() {
  GenericError("Please check your add-on settings.");
}


/* Configure event handlers */
on(target, EventNames.InstanceUrlChanged, icinga.InstanceUrlChanged);
on(target, EventNames.HostgroupChanged, icinga.HostgroupChanged);
on(target, EventNames.QueryStatus, icinga.RefreshStatusTriggered);
on(target, EventNames.Unconfigured, Unconfigured);
on(target, EventNames.ProcessResponse, icinga.ProcessResponse);
on(target, EventNames.StatusUpdate, ProcessStatusUpdate);
on(target, EventNames.GenericError, GenericError);
on(target, EventNames.OpenTab, tabs.open);
on(target, EventNames.AuthenticationData, icinga.AuthenticationData);

on(panel.port, 'triggerCmdExec', icinga.TriggerCmdExec);
on(panel.port, 'triggerRefresh', icinga.RefreshStatusTriggered);
on(panel.port, 'triggerOpenPage', tabs.open);

/* Listen to changes in the add-on preferences for the url */
var prefs_statuscgi_timeout = false;

sp.on("extensions.imoin.cgipath", function() {
    if (prefs_statuscgi_timeout) {
        timers.clearTimeout(prefs_statuscgi_timeout);
    }
    prefs_statuscgi_timeout = timers.setTimeout(function() {
        emit(target, EventNames.InstanceUrlChanged, prefs["extensions.imoin.cgipath"]);
        triggerrefresh();
    }, 500);
});

emit(target, EventNames.HostgroupChanged, prefs["extensions.imoin.hostgroup"]);
// set url from settings and setup the process
emit(target, EventNames.InstanceUrlChanged, prefs["extensions.imoin.cgipath"]);

var cuthost = function(url) {
    var i = url.indexOf("/", 8);
    if (i > -1) {
      url = url.substring(0, i);
    }
    return url;
}

exports.cuthost = cuthost;

/* Prepare authentication */
var prepareAuthentication = function(done) {
  if (typeof done !== "function") {
    done = function() {}
  }
  var data = {authtype: 0, username: '', password: ''}
  switch (prefs["extensions.imoin.authentication"]) {
    case 0:
      emit(target, EventNames.AuthenticationData, data);
      done();
      
    case 1:
      var purl = cuthost(prefs["extensions.imoin.cgipath"]);
      var seachForUsername = prefs["extensions.imoin.authentication.username"] || "";
      
      passwords.search({
        onComplete: function onComplete(credentials) {
          credentials.forEach(function(credential) {
            if (credential.url === purl && 
                (seachForUsername === "" || credential.username === seachForUsername)) {
              data.authtype = 1;
              data.username = credential.username;
              data.password = credential.password;
              
              emit(target, EventNames.AuthenticationData, data);
            }
          });
          
          done();
        }
      });
      break;
  }
}
sp.on("extensions.imoin.authentication", prepareAuthentication);

/* Listen to changes on the update interval and trigger the update */
var triggerrefresh = function() {
    ShowNormalButtonIcon();
    prepareAuthentication(function() {
      emit(target, EventNames.QueryStatus);
    })
}
var createRefreshTriggerInterval = function() {
    if (prefs["extensions.imoin.updateinterval"] < 1) {
        prefs["extensions.imoin.updateinterval"] = 1;
    }
    return timers.setInterval(triggerrefresh, prefs["extensions.imoin.updateinterval"] * 60000);
}
var prefs_refresh_interval = createRefreshTriggerInterval();
triggerrefresh();
sp.on("extensions.imoin.updateinterval", function() {
    if (prefs_refresh_interval) {
        timers.clearInterval(prefs_refresh_interval);
    }
    prefs_refresh_interval = createRefreshTriggerInterval();
});
sp.on("extensions.imoin.hostgroup", function() { emit(target, EventNames.HostgroupChanged, prefs["extensions.imoin.hostgroup"]); });