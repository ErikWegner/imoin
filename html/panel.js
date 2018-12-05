'use strict';

import './dom';
import { design as design1 } from './design1';
import { design as design2 } from './design2';

const panelsettings = {
    designId: 1,
    design: design1,
    lastdata: {
        message: 'Waiting for data...',
        hostgroupinfo: null,
        updatetime: new Date().toISOString(),
    },
}

function log(o) {
    //console.log(o);
}
window.postPanelMessage = function postPanelMessage(data) {
}
window.messageFromBackgroundPage = function messageFromBackgroundPage (message) {
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

    window.postPanelMessage = function postPanelMessage(data) {
        myPort.postMessage(data);
    }
} else if (typeof self === "object" && typeof self.addEventListener === "function" && typeof require === "function") {
    // Electron
    /*const { ipcRenderer } = require('electron');

    ipcRenderer.on('topanel', function (event) {
        log(event);
    });
r.setAttribute("class", "service");
    var span;

    span = document.createElement("span");
    span.setAttribute("class", "servicename");
    if (servicedata.servicelink) {
        span.setAttribute("data-url", servicedata.servicelink);
    }
    span.appendChild(document.createTextNode(servicedata.name));
    r.appendChild(span);
    postPanelMessage = function (data) {
        ipcRenderer.send('frompanel', data);
    }*/
}

// store a rendered template for later display
var rendered_template = document.createTextNode("");

var filtered_lists_templates = {};

function setupUISettings(data) {
    let s = document.getElementById('uistyles');
    if (s) {
        s.remove();
    }
    s = document.createElement('style');
    s.setAttribute('id', 'uistyles');
    let t = document.createTextNode('body {font-size:' + data.fontsize + '%}');
    s.appendChild(t);
    if (data.inlineresults) {
        t = document.createTextNode('.hostcheckinfo, .service .info { display: inline; }');
        s.appendChild(t);
    }
    document.head.appendChild(s);

    /* Check design */
    if (data.design != panelsettings.designId) {
        panelsettings.designId = data.design;
        if (panelsettings.designId == 2) {
            panelsettings.design = design2;
        } else {
            panelsettings.design = design1;
        }
        showAndUpdatePanelContent();
    }
}

function showAndUpdatePanelContent(newdata) {
    if (newdata) {
        panelsettings.lastdata = newdata;
    }
    const data = panelsettings.lastdata;
    const message = data.message;
    log("Rendering main template")
    rendered_template = renderMainTemplate(data);
    
    if (message) {
        log("Message " + message)
        rendered_template.unshift(renderTemplateError(message));
    }

    log("Render prep done");
    log("Removing");
    const targetElement = document.getElementById('app') || document.body;
    while (targetElement.childNodes.length > 0) {
        targetElement.removeChild(targetElement.childNodes[targetElement.childNodes.length - 1]);
    }
    log("Adding");
    if (rendered_template.length > 0) {
        for (let i in rendered_template) {
            targetElement.appendChild(rendered_template[i]);
        }
    } else {
        targetElement.appendChild(rendered_template);
    }
    log("Done")

    registerMainEventHandlers();
}

function renderTemplateError(message) {
    var r = document.createElement("div");
    r.setAttribute("style", "text-align:center");
    var img = document.createElement("img");
    img.setAttribute("src", "../icons/logo-66x32.png");
    img.setAttribute("alt", "Icinga logo");
    r.appendChild(img);
    r.appendChild(document.createElement("br"));
    var p = document.createElement("p");
    p.setAttribute("class", "errormessage");
    r.appendChild(p);
    p.appendChild(document.createTextNode(message));

    return r;
}

function renderHostTemplate(hostdata) {
    return panelsettings.design.hosttemplate(hostdata, chkimg);
}

function renderServiceTemplate(servicedata) {
    return panelsettings.design.servicetemplate(servicedata, chkimg);
}

var chkimg = document.createElement("span");
chkimg.setAttribute("title", "Recheck");
chkimg.setAttribute("class", "recheck");
chkimg.setAttribute("data-command", "recheck");

var ackimg = document.createElement("span");
ackimg.setAttribute("title", "Acknowledge");
ackimg.setAttribute("class", "ack");
ackimg.setAttribute("data-command", "ack");


// switch between the filtered details lists
function listswitch(e) {
    if (e == null || e.target == null) return;
    var filtervalue = e.target.getAttribute("value");
    var details_el = document.getElementById("details");
    if (details_el && filtervalue in filtered_lists_templates) {
        details_el.replaceChild(filtered_lists_templates[filtervalue], details_el.childNodes[0]);
        registerDetailsEventHandlers();
    }
}

function registerEventHanderForClass(handler, classname) {
    var elements = document.getElementsByClassName(classname);
    Array.prototype.forEach.call(elements, function (element) {
        element.addEventListener("click", handler);
    });
}

function registerEventHanderBySelector(handler, selector) {
    var elements = document.querySelectorAll(selector);
    Array.prototype.forEach.call(elements, function (element) {
        element.addEventListener("click", handler);
    });
}

function registerMainEventHandlers() {
    var cbnames = ["r1", "r2", "r3", "i"];
    for (var cbname_index in cbnames) {
        var el = document.getElementById(cbnames[cbname_index]);
        if (el) {
            el.addEventListener("click", listswitch);
        }
    }

    registerEventHanderForClass(triggerRefresh, 'refresh');
    registerEventHanderForClass(triggerShowOptions, 'options');
    registerDetailsEventHandlers();
}

function registerDetailsEventHandlers() {
    registerEventHanderForClass(triggerOpenPage, 'hostname');
    registerEventHanderForClass(triggerOpenPage, 'servicename');
    registerEventHanderForClass(triggerCmdExec, 'recheck');
    registerEventHanderForClass(triggerCmdExec, 'ack');
    registerEventHanderBySelector(triggerRefresh, '.instance .refresh');
}

function renderMainTemplate(statusdata) {
    // render three lists
    // list 1: show a host, if any of its services is not ok, show service if it is not ok
    // list 2: show all hosts, show service if it is not ok
    // list 3: show all hosts, show all services

    var html1 = document.createElement("div"), html2 = document.createElement("div"),
        html3 = document.createElement("div");
    var hostdetail;
    var hosts = statusdata.hosts;

    for (var hostindex in hosts) {
        hostdetail = hosts[hostindex];
        log("Processing host " + hostdetail.name)

        // Show in list 1?
        var show_host_in_list1 = hostdetail.appearsInShortlist;
        var all_serviceshtml = [];
        var not_ok_serviceshtml = [];
        var renderbuffer;

        // output the details for a host
        hostdetail.acknowledged = hostdetail.has_been_acknowledged === true ? "A" : "";

        for (var serviceindex in hostdetail.services) {
            var servicedetail = hostdetail.services[serviceindex];
            servicedetail.host = hostdetail;
            servicedetail.acknowledged = servicedetail.has_been_acknowledged === true ? "A" : "";

            renderbuffer = renderServiceTemplate(servicedetail);

            all_serviceshtml.push(renderbuffer.cloneNode(true));

            // Show in list 2?
            if (servicedetail.appearsInShortlist) {
                not_ok_serviceshtml.push(renderbuffer.cloneNode(true));
            }
        }

        hostdetail.servicesdata = not_ok_serviceshtml;
        renderbuffer = renderHostTemplate(hostdetail);

        // list 1
        if (show_host_in_list1) {
            renderbuffer.forEach(e => 
                html1.appendChild(e.cloneNode(true)));
        }

        // list 2
        renderbuffer.forEach(e => 
            html2.appendChild(e));

        // list 3
        hostdetail.servicesdata = all_serviceshtml;
        renderHostTemplate(hostdetail).forEach(e => 
            html3.appendChild(e));
    }

    var html4 = panelsettings.design.instanceslist(statusdata);

    filtered_lists_templates = {
        filter0: html1,
        filter1: html2,
        filter2: html3,
        instances: html4
    };


    // top table and hosts list
    var r = panelsettings.design.header(statusdata);

    const div1 = document.createElement("div");
    div1.setAttribute("class", "content");
    div1.id = "details";
    div1.appendChild(html1);

    return [r, div1];
}

function triggerRefresh(e) {
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

function triggerCmdExec(e) {
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

function triggerOpenPage(e) {
    const url = e.target.getAttribute("data-url");
    if (url) {
        window.postPanelMessage({ command: "triggerOpenPage", url: url });
    }
}

function triggerShowOptions() {
    window.postPanelMessage({ command: "triggerShowOptions" });
}

showAndUpdatePanelContent();
