var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var self = require("sdk/self");
var icinga = require("./icinga");
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
    StatusUrlChanged: "StatusUrlChanged"
};


on(target, EventNames.StatusUrlChanged, icinga.StatusUrlChanged);

/* Listen to changes in the add-on preferences */
var statuscgi_timeout = false;
require("sdk/simple-prefs").on("statuscgi", function() {
    if (statuscgi_timeout) {
        timers.clearTimeout(statuscgi_timeout);
    }
    statuscgi_timeout = timers.setTimeout(function() {
        emit(target, EventNames.StatusUrlChanged, prefs.statuscgi);
    }, 500);
});
