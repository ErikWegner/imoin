import Vue from 'vue'
import Basic from './designs/basic/imoin-root.vue'
import MJTable from './designs/mjtable/imoin-root.vue'

function log(a,b) {
    // if (b) {
    //     console.log(a,b);
    // } else {
    //     console.log(a);
    // }
}

const panelapp = window.panelapp = new Vue({
    el: '#app',
    data: {
        paneldata: {},
        design: 1
    },
    render: function (createElement) {
        log("render");
        const target = this.design == 1 ? Basic : MJTable
        return createElement(target, { props: { paneldata: this.$data.paneldata } });
    }
})

window.postPanelMessage = function postPanelMessage(data) {
    // no-op
}

window.messageFromBackgroundPage = function messageFromBackgroundPage(message) {
    log("messageFromBackgroundPage", message);
    var command = message.command || "";
    var data = message.data || {};

    if (command === "ProcessStatusUpdate") {
        showAndUpdatePanelContent(data);
    }

    if (command === "uisettings") {
        setupUISettings(data);
    }
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
    myPort.onMessage.addListener(messageFromBackgroundPage);

    window.postPanelMessage = function (data) {
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
    log("showAndUpdatePanelContent", data);
    panelapp.paneldata = data;
}

window.triggerRefresh = function triggerRefresh(e) {
    const el = e.target;
    const message = { command: "triggerRefresh" };
    if (el) {
        const parentElement = el.parentElement;
        if (parentElement) {
            const instanceindex = parentElement.getAttribute("data-instanceindex");
            if (instanceindex != null) {
                message['instanceindex'] = instanceindex;
            }
        }
    }

    window.postPanelMessage(message);
}

window.triggerCmdExec = function triggerCmdExec(e) {
    const el = e.target;
    if (el === null) return;

    const command = el.getAttribute("data-command");

    const parentElement = el.parentElement;
    if (parentElement === null) return;

    const hostname = parentElement.getAttribute("data-hostname");
    const servicename = parentElement.getAttribute("data-servicename") || "";
    const instanceindex = parentElement.getAttribute("data-instanceindex");

    window.postPanelMessage({
        command: "triggerCmdExec",
        hostname: hostname,
        servicename: servicename,
        remoteCommand: command,
        instanceindex: instanceindex
    });
}
