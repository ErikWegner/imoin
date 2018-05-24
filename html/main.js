import Vue from 'vue'
//import App from './App.vue'
import Basic from './designs/basic/imoin-root.vue'
import MJTable from './designs/mjtable/imoin-root.vue'

window.panelapp = new Vue({
  el: '#app',
  data: {
    paneldata: {},
    design: 1
  },
  render: function(createElement) {
    const target = this.design == 1 ? Basic : MJTable
    return createElement(target, {props:{paneldata: this.$data.paneldata}});
  }
})

function log(o) {
    console.log(o);
}
function postPanelMessage(data) {
}

if (typeof chrome !== "undefined" || typeof browser !== "undefined") {
    // Web extension in Chrome or Firefox
    var host = chrome || browser;
    // Edge browser
    if (typeof browser !== "undefined" && browser.runtime !== null) {
        host = browser;
    }

    // This script runs at the moment that the popup is displayed
    const myPort = host.runtime.connect();
    myPort.onMessage.addListener(function (message) {
        var command = message.command || "";
        var data = message.data || {};
        
        if (command === "ProcessStatusUpdate") {
            showAndUpdatePanelContent(data);
        }

        if (command === "uisettings") {
            setupUISettings(data);
        }

    });

    postPanelMessage = function (data) {
        myPort.postMessage(data);
    }
} else if (typeof self === "object" && typeof self.addEventListener === "function") {
    // Electron
}

function setupUISettings(data) {
    let s = document.getElementById('uistyles');
    if (s) {
        s.remove();
    }
    s = document.createElement('style');
    s.setAttribute('id', 'uistyles');
    const t = document.createTextNode('body {font-size:' + data.fontsize + '%}');
    s.appendChild(t);
    document.head.appendChild(s);
    panelapp.design = data.design;
}

function showAndUpdatePanelContent(data) {
    panelapp.paneldata = data
}