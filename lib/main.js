var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var prefs = require("sdk/simple-prefs").prefs;
var timers = require("sdk/timers");
var data = require("sdk/self").data;

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
  contentURL: self.data.url("panel.html"),
  onHide: handleHide,
  contentScriptFile: [
        data.url("jquery2.js"),
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

var PanelResize = function(w,h) {
  panel.resize(Math.min(Math.max(w,240), 640), Math.min(Math.max(h,180), 480));  
}

var { on, once, off, emit } = require('sdk/event/core');
var target = { name: 'imointarget' };
var EventNames = {
    InstanceUrlChanged: "InstanceUrlChanged",
    QueryStatus: "QueryStatus",
    Unconfigured: "Unconfigured",
    GenericError: "GenericError",
    ProcessResponse: "ProcessResponse",
    StatusUpdate: "StatusUpdate"
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
  console.log("Show red button icon");
  button.icon = {
    "16": "./icon-16warn.png",
    "32": "./icon-32warn.png",
    "64": "./icon-64warn.png"
  }
}

var ShowRedButtonIcon = function() {
  console.log("Show red button icon");
  button.icon = {
    "16": "./icon-16err.png",
    "32": "./icon-32err.png",
    "64": "./icon-64err.png"
  }
}

var ProcessStatusUpdate = function(status) {
  console.log("ProcessStatusUpdate");
  console.log(status);
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
on(target, EventNames.QueryStatus, icinga.RefreshStatusTriggered);
on(target, EventNames.Unconfigured, Unconfigured);
on(target, EventNames.ProcessResponse, icinga.ProcessResponse);
on(target, EventNames.StatusUpdate, ProcessStatusUpdate);
on(target, EventNames.GenericError, GenericError);

on(panel.port, 'triggerRefresh', icinga.RefreshStatusTriggered);
on(panel.port, 'resize', PanelResize);

/* Listen to changes in the add-on preferences for the url */
var prefs_statuscgi_timeout = false;
require("sdk/simple-prefs").on("extensions.imoin.cgipath", function() {
    if (prefs_statuscgi_timeout) {
        timers.clearTimeout(prefs_statuscgi_timeout);
    }
    prefs_statuscgi_timeout = timers.setTimeout(function() {
        emit(target, EventNames.InstanceUrlChanged, prefs["extensions.imoin.cgipath"]);
        triggerrefresh();
    }, 500);
});
// set url from settings and setup the process
emit(target, EventNames.InstanceUrlChanged, prefs["extensions.imoin.cgipath"]);



/* Listen to changes on the update interval and trigger the update */
var triggerrefresh = function() {
    ShowNormalButtonIcon();
    emit(target, EventNames.QueryStatus);
}
var createRefreshTriggerInterval = function() {
    if (prefs["extensions.imoin.updateinterval"] < 1) {
        prefs["extensions.imoin.updateinterval"] = 1;
    }
    return timers.setInterval(triggerrefresh, prefs["extensions.imoin.updateinterval"] * 60000);
}
var prefs_refresh_interval = createRefreshTriggerInterval();
triggerrefresh();
require("sdk/simple-prefs").on("extensions.imoin.updateinterval", function() {
    if (prefs_refresh_interval) {
        timers.clearInterval(prefs_refresh_interval);
    }
    prefs_refresh_interval = createRefreshTriggerInterval();
});
