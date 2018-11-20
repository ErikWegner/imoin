'use strict';

function log(o) {
    //console.log(o);
}
function postPanelMessage(data) {
}
function messageFromBackgroundPage (message) {
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

    postPanelMessage = function (data) {
        myPort.postMessage(data);
    }
} else if (typeof self === "object" && typeof self.addEventListener === "function" && typeof require === "function") {
    // Electron
    const { ipcRenderer } = require('electron');

    ipcRenderer.on('topanel', function (event) {
        log(event);
    });

    postPanelMessage = function (data) {
        ipcRenderer.send('frompanel', data);
    }
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
    s.appendChild(t);debugger
    if (data.inlineresults) {
        t = document.createTextNode('.hostcheckinfo, .service .info { display: inline; }');
        s.appendChild(t);
    }
    document.head.appendChild(s);
}

function showAndUpdatePanelContent(data) {
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
    var div2, span;
    var r = document.createElement("div");
    r.setAttribute("class", "host");

    r.appendChild(div2 = document.createElement("div"));
    div2.appendChild(span = document.createElement("span"));
    span.setAttribute("class", "hostname");
    if (hostdata.hostlink) {
        span.setAttribute("data-url", hostdata.hostlink);
    }
    span.appendChild(document.createTextNode(hostdata.name));

    div2.appendChild(span = document.createElement("span"));
    span.setAttribute("class", "status " + hostdata.status);
    span.appendChild(document.createTextNode(hostdata.status));

    div2.appendChild(span = document.createElement("span"));
    span.setAttribute("class", "actions");
    span.setAttribute("data-hostname", hostdata.name);
    span.setAttribute("data-instanceindex", hostdata.instanceindex);
    //span.appendChild(ackimg.cloneNode(true));
    span.appendChild(document.createTextNode(" "));
    span.appendChild(chkimg.cloneNode(true));

    div2.appendChild(span = document.createElement("span"));
    span.setAttribute("class", "hostcheckinfo");
    span.appendChild(document.createTextNode(hostdata.checkresult));

    r.appendChild(div2 = document.createElement("div"));
    div2.setAttribute("class", "services");

    for (var i in hostdata.servicesdata) {
        div2.appendChild(hostdata.servicesdata[i]);
    }

    return r;
}

function renderServiceTemplate(servicedata) {
    var r = document.createElement("div");
    r.setAttribute("class", "service");
    var span;

    span = document.createElement("span");
    span.setAttribute("class", "servicename");
    if (servicedata.servicelink) {
        span.setAttribute("data-url", servicedata.servicelink);
    }
    span.appendChild(document.createTextNode(servicedata.name));
    r.appendChild(span);

    span = document.createElement("span");
    span.setAttribute("class", "status " + servicedata.status);
    span.appendChild(document.createTextNode(servicedata.status));
    r.appendChild(span);

    span = document.createElement("span");
    span.setAttribute("class", "actions");
    span.setAttribute("data-hostname", servicedata.host.name);
    span.setAttribute("data-instanceindex", servicedata.host.instanceindex);
    span.setAttribute("data-servicename", servicedata.name);
    //span.appendChild(ackimg.cloneNode(true));
    span.appendChild(document.createTextNode(" "));
    span.appendChild(chkimg.cloneNode(true));
    r.appendChild(span);

    var divc = document.createElement("div");
    divc.setAttribute("class", "info");
    divc.appendChild(document.createTextNode(servicedata.checkresult));
    r.appendChild(divc);

    return r;
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

function renderInstancesList(statusdata) {
    var r = document.createElement("div");
    if (statusdata.instances) {
        var table = document.createElement("div");
        r.appendChild(table);
        Object.keys(statusdata.instances).forEach((key) => {
            var instance = statusdata.instances[key];
            var tr = document.createElement('div');
            tr.setAttribute("class", "instance");
            var td, a;

            // Instance label
            tr.appendChild(td = document.createElement('span'));
            td.setAttribute("class", "instancename");
            td.appendChild(document.createTextNode(instance.instancelabel));

            // Instance update time
            tr.appendChild(td = document.createElement('span'));
            td.setAttribute("class", "instanceupdatetime")
            td.appendChild(document.createTextNode(instance.updatetime));

            // Instance actions
            tr.appendChild(td = document.createElement('span'));
            td.setAttribute("class", "actions")
            td.setAttribute("data-instanceindex", key);
            td.appendChild(a = document.createElement("span"));
            a.setAttribute("class", "refresh");
            a.appendChild(document.createTextNode("↺"));

            table.appendChild(tr);
        });
    }

    return r;
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
            html1.appendChild(renderbuffer.cloneNode(true));
        }

        // list 2
        html2.appendChild(renderbuffer);

        // list 3
        hostdetail.servicesdata = all_serviceshtml;
        html3.appendChild(renderHostTemplate(hostdetail));
    }

    var html4 = renderInstancesList(statusdata);

    filtered_lists_templates = {
        filter0: html1,
        filter1: html2,
        filter2: html3,
        instances: html4
    };


    // top table and hosts list
    var r = document.createElement("div");
    r.setAttribute("class", "header");
    r.setAttribute("style", "text-align:center");

    var p, a, div1, table, tr, th, td, img;
    r.appendChild(p = document.createElement("p"));
    p.appendChild(a = document.createElement("span"));
    a.setAttribute("class", "refresh");
    a.appendChild(document.createTextNode("↺ Refresh"));
    p.appendChild(document.createTextNode(" "));
    p.appendChild(a = document.createElement("span"));
    a.setAttribute("class", "options");
    a.appendChild(img = document.createElement("img"));
    img.setAttribute("style", "width: auto; height: 14px;");
    img.setAttribute("src", "./gear.svg");
    img.setAttribute("title", "Options");
    if (statusdata.hostgroupinfo !== null && statusdata.hostgroupinfo !== "") p.appendChild(document.createTextNode(" " + statusdata.hostgroupinfo));

    r.appendChild(div1 = document.createElement("div"));

    div1.appendChild(table = document.createElement("table"));
    table.setAttribute("class", "main");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("style", "vertical-align:top; display: inline-block; margin-right: 1em");

    table.appendChild(tr = document.createElement("tr"));
    tr.appendChild(th = document.createElement("th"));
    th.appendChild(document.createTextNode("Service status"))
    th.setAttribute("colspan", "2");

    table.appendChild(tr = document.createElement("tr"));
    tr.className = "OK";
    AddCellToTr(tr, "Ok");
    AddCellToTr(tr, statusdata.filteredServiceok + "/" + statusdata.totalservices, "num");

    table.appendChild(tr = document.createElement("tr"));
    tr.className = "WARN";
    AddCellToTr(tr, "Warn");
    AddCellToTr(tr, statusdata.filteredServicewarnings + "/" + statusdata.totalservices, "num");

    table.appendChild(tr = document.createElement("tr"));
    tr.className = "CRIT";
    AddCellToTr(tr, "Crit");
    AddCellToTr(tr, statusdata.filteredServiceerrors + "/" + statusdata.totalservices, "num");

    div1.appendChild(table = document.createElement("table"));
    table.setAttribute("class", "main");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("style", "display: inline-block");

    table.appendChild(tr = document.createElement("tr"));
    tr.appendChild(th = document.createElement("th"));
    th.appendChild(document.createTextNode("Host status"))
    th.setAttribute("colspan", "2");

    table.appendChild(tr = document.createElement("tr"));
    tr.className = "UP";
    AddCellToTr(tr, "Up");
    AddCellToTr(tr, statusdata.filteredHostup + "/" + statusdata.totalhosts, "num");

    table.appendChild(tr = document.createElement("tr"));
    tr.className = "DOWN";
    AddCellToTr(tr, "Down");
    AddCellToTr(tr, statusdata.filteredHosterrors + "/" + statusdata.totalhosts, "num");

    table.appendChild(tr = document.createElement("tr"));
    tr.className = "space";
    tr.appendChild(td = document.createElement("td"));
    td.setAttribute("colspan", "2");

    table.appendChild(tr = document.createElement("tr"));
    tr.className = "updatetime";
    tr.appendChild(td = document.createElement("td"));
    td.setAttribute("colspan", "2");
    td.appendChild(document.createTextNode(statusdata.updatetime));

    // buttons to switch between lists
    r.appendChild(div1 = document.createElement("div"));
    AddInput(div1, "filter0", "r1", "Errors/Warnings").setAttribute("checked", "checked");
    AddInput(div1, "filter1", "r2", "All Hosts");
    AddInput(div1, "filter2", "r3", "All Services");
    
    if (statusdata.instances && Object.keys(statusdata.instances).length > 1) {
        AddInput(div1, "instances", "i", "Instances");
    }

    div1 = document.createElement("div");
    div1.setAttribute("class", "content");
    div1.id = "details";
    div1.appendChild(html1);

    return [r, div1];
}

function AddInput(parent, value, id, labeltext) {
    var input = document.createElement("input");
    parent.appendChild(input);
    input.setAttribute("type", "radio");
    input.setAttribute("class", "cb");
    input.setAttribute("value", value);
    input.setAttribute("name", "filter");
    input.setAttribute("id", id);

    var label = document.createElement("label");
    parent.appendChild(label);
    label.setAttribute("for", id);
    label.appendChild(document.createTextNode(labeltext));
    return input;
}

function AddCellToTr(tr, text, tdclass) {
    var td = document.createElement("td")
    td.appendChild(document.createTextNode(text));
    if (tdclass !== null && tdclass !== "") td.className = tdclass;
    tr.appendChild(td);
    return tr;
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

    postPanelMessage(message);
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

    postPanelMessage({
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
        postPanelMessage({ command: "triggerOpenPage", url: url });
    }
}

function triggerShowOptions() {
    postPanelMessage({ command: "triggerShowOptions" });
}

showAndUpdatePanelContent({});
