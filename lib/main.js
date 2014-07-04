var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var prefs = require("sdk/simple-prefs").prefs;
var timers = require("sdk/timers");

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
  onHide: handleHide
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}




var { on, once, off, emit } = require('sdk/event/core');
var target = { name: 'imointarget' };
var EventNames = {
    StatusUrlChanged: "StatusUrlChanged",
    QueryStatus: "QueryStatus",
    Unconfigured: "Unconfigured"
};
var icinga = require("./icinga");
icinga.SetEventTransport(target);
icinga.SetEventNames(EventNames);


var ShowRedButtonIcon = function() {
  console.log("Show red button icon");
  button.icon = {
    "16": "./icon-16err.png",
    "32": "./icon-32err.png",
    "64": "./icon-64err.png"
  }
}


on(target, EventNames.StatusUrlChanged, icinga.StatusUrlChanged);
on(target, EventNames.QueryStatus, icinga.RefreshStatusTriggered);
on(target, EventNames.Unconfigured, ShowRedButtonIcon);

/* Listen to changes in the add-on preferences for the url */
var prefs_statuscgi_timeout = false;
require("sdk/simple-prefs").on("extensions.imoin.statuscgi", function() {
    if (prefs_statuscgi_timeout) {
        timers.clearTimeout(prefs_statuscgi_timeout);
    }
    prefs_statuscgi_timeout = timers.setTimeout(function() {
        emit(target, EventNames.StatusUrlChanged, prefs["extensions.imoin.statuscgi"]);
    }, 500);
});
// set url from settings and setup the process
emit(target, EventNames.StatusUrlChanged, prefs["extensions.imoin.statuscgi"]);



/* Listen to changes on the update interval and trigger the update */
var triggerrefresh = function() {
    console.log("emitting triggerrefresh");
    emit(target, EventNames.QueryStatus);
}
var createRefreshTriggerInterval = function() {
    console.log("creating refresh interval");
    return timers.setInterval(triggerrefresh, prefs["extensions.imoin.updateinterval"] * 2000);
}
var prefs_refresh_interval = createRefreshTriggerInterval();
require("sdk/simple-prefs").on("extensions.imoin.updateinterval", function() {
    if (prefs_refresh_interval) {
        timers.clearInterval(prefs_refresh_interval);
    }
    prefs_refresh_interval = createRefreshTriggerInterval();
});
