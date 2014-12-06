var errortemplate = document.getElementById("errortemplate").innerHTML;
var maintemplate = document.getElementById("maintemplate").innerHTML;
var hosttemplate = document.getElementById("hosttemplate").innerHTML;
var servicetemplate = document.getElementById("servicetemplate").innerHTML;
var processingtemplate = document.getElementById("processing").innerHTML;

var panelcontentstatus = {
    needs_processing: 0,
    error: 1,
    data: 2,
    empty: 3,
    template_rendered: 4
}

var panelcontent = panelcontentstatus.processing

// store the incoming data object for later processing
var statusdata = null;

// store a rendered template for later display
var rendered_template = "";

var filtered_lists_templates = {};

var isShowing = false;

self.port.on("hide", function() {
   isShowing = false; 
});

self.port.on("show", function () {
//    console.log("panel show: " + panelcontent);
    isShowing = true;
    showAndUpdatePanelContent();
});

function showAndUpdatePanelContent() {
    switch(panelcontent) {
        case panelcontentstatus.needs_processing:
            rendered_template = renderMainTemplate();
            break;

        case panelcontentstatus.empty:
            rendered_template = renderTemplate(errortemplate, { message: "No data yet" });
            break;
        
        case panelcontentstatus.error:
            rendered_template = renderTemplate(errortemplate, statusdata);
            break;
    }
    
    if (panelcontent == panelcontentstatus.template_rendered) {
        document.body.innerHTML = rendered_template;
        registerMainEventHandlers();
    }
}

var chkimg = '<img src="rck.png" width="14" height="14" alt="Recheck" title="Recheck" class="recheck" data-command="recheck" />';
var ackimg = '<img src="ack.png" width="14" height="14" alt="Acknowledge" title="Acknowledge" class="ack" data-command="ack" />';

// switch between the filtered details lists
function listswitch(e) {
    if (e == null || e.target == null) return;
    var filtervalue = e.target.getAttribute("value");
    var details_el = document.getElementById("details");
    if (details_el && filtervalue in filtered_lists_templates) {
        details_el.innerHTML = filtered_lists_templates[filtervalue];
        registerDetailsEventHandlers();
    }
}

function registerEventHanderForClass(handler, classname) {
    var elements = document.getElementsByClassName(classname);
    Array.prototype.forEach.call(elements, function(element) {
        element.addEventListener("click", handler);
    });
}

function registerMainEventHandlers() {
    var cbnames = ["r1", "r2", "r3"];
    for (var cbname_index in cbnames) {
        var el = document.getElementById(cbnames[cbname_index]);
        if (el) {
            el.addEventListener("click", listswitch);
        }
    }
    
    registerEventHanderForClass(triggerRefresh, 'refresh');
    registerDetailsEventHandlers();
}

function registerDetailsEventHandlers() {
    registerEventHanderForClass(triggerOpenPage, 'hostname');
    registerEventHanderForClass(triggerOpenPage, 'servicename');
    registerEventHanderForClass(triggerCmdExec, 'recheck');
    registerEventHanderForClass(triggerCmdExec, 'ack');
}

function renderMainTemplate() {
    // render three lists
    // list 1: show a host, if any of its services is not ok, show service if it is not ok
    // list 2: show all hosts, show service if it is not ok
    // list 3: show all hosts, show all services
    
    var html1 = "", html2 = "", html3 = "";
    
    for (hostindex in statusdata.details) {
        hostdetail = statusdata.details[hostindex];

        var show_host_in_list1 = hostdetail.status !== "UP";
        var all_serviceshtml = "";
        var not_ok_serviceshtml = "";
        var renderbuffer = "";
        
        // output the details for a host
        hostdetail.actions = chkimg + " " + ackimg;
        hostdetail.acknowledged = hostdetail.has_been_acknowledged === true ? "A" : "";
        
        for (serviceindex in hostdetail.services) {
            servicedetail = hostdetail.services[serviceindex];
            servicedetail.host = hostdetail;
            servicedetail.actions = chkimg + " " + ackimg;
            servicedetail.acknowledged = servicedetail.has_been_acknowledged === true ? "A" : "";
            
            renderbuffer = renderTemplate(servicetemplate, servicedetail);
            
            all_serviceshtml += renderbuffer;
            
            if (servicedetail.status !== "OK") {
                show_host_in_list1 = true;
                not_ok_serviceshtml += renderbuffer;
            }
        }

        hostdetail.servicesdata = not_ok_serviceshtml;
        renderbuffer = renderTemplate(hosttemplate, hostdetail);
        
        // list 1
        if (show_host_in_list1) {
            html1 += renderbuffer;
        }
        
        // list 2
        html2 += renderbuffer;
        
        // list 3
        hostdetail.servicesdata = all_serviceshtml;
        html3 += renderTemplate(hosttemplate, hostdetail);
    }
    
    panelcontent = panelcontentstatus.template_rendered;

    statusdata.details = html1;
    
    filtered_lists_templates = {
        filter0: html1,
        filter1: html2,
        filter2: html3
    };
    
    return renderTemplate(maintemplate, statusdata);
}

function renderTemplate(template, data) {
    var result = template;
    if ("object" === typeof(data)) {
        var keys = Object.keys(data);
        for (var key_index in keys) {
            var okey = keys[key_index];
            result = result.replace(new RegExp('{' + okey + '}', "g"), data[okey]);
        }
    }
    
    panelcontent = panelcontentstatus.template_rendered;
    return result;
}

self.port.on("ProcessStatusUpdate", function(p_status) {
    panelcontent = panelcontentstatus.needs_processing;
    statusdata = p_status;
    debugger;
    if (isShowing) {
        showAndUpdatePanelContent();
    }
});


self.port.on("GenericError", function(message) {
    statusdata = { message: message };
    panelcontent = panelcontentstatus.error;
});

var triggerRefresh = function() {
    self.port.emit("triggerRefresh");
}

var triggerCmdExec = function(e) {
    var el = e.target
    if (el == null) return;
    
    var command = el.getAttribute("data-command");
    
    el = el.parentElement;
    if (el == null) return;
    
    var hostname = el.getAttribute("data-hostname");
    var servicename = el.getAttribute("data-servicename") || "";
    
    self.port.emit("triggerCmdExec", {hostname: hostname, servicename: servicename, command: command});
}

var triggerOpenPage = function(e) {
    var url = e.target.getAttribute("data-url");
    self.port.emit("triggerOpenPage", url);
}
