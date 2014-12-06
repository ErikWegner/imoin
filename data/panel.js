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

self.port.on("show", function (output) {
    console.log("panel show: " + panelcontent);
    
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
    }
});

var chkimg = '<img src="rck.png" width="14" height="14" alt="Recheck" title="Recheck" class="recheck" />';
var ackimg = '<img src="ack.png" width="14" height="14" alt="Acknowledge" title="Acknowledge" class="ack" />';

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
            servicedetail.initialhide = servicedetail.status === "OK" ? "display: none;" : "";
            
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
    
    return renderTemplate(maintemplate, statusdata);
}

function renderTemplate(template, data) {
    console.log("renderTemplate");
    var result = template;
    if ("object" === typeof(data)) {
        var keys = Object.keys(data);
        for (var key_index in keys) {
            var okey = keys[key_index];
            console.log("key " + okey);
            result = result.replace(new RegExp('{' + okey + '}', "g"), data[okey]);
        }
    }
    
    panelcontent = panelcontentstatus.template_rendered;
    return result;
}

self.port.on("ProcessStatusUpdate", function(p_status) {
    console.log("panel: ProcessStatusUpdate");
    panelcontent = panelcontentstatus.needs_processing;
    statusdata = p_status;
});


self.port.on("GenericError", function(message) {
    statusdata = { message: message };
    panelcontent = panelcontentstatus.error;
});

/*
self.port.on("ProcessStatusUpdate", function(status) {
    // this function refreshes the tables
    $('body').html(maintemplate(status));
    
    dstatus = status;
    var hostcontainer = null;
    var hostindex;
    var hostdetail;
    var serviceindex;
    var servicedetail;
    detailstable = $('#details');
    var largehtml = "";
    for (hostindex in dstatus.details) {
        hostdetail = dstatus.details[hostindex];
        // output the details for a host
        hostdetail.actions = chkimg + " " + ackimg;
        hostdetail.acknowledged = hostdetail.has_been_acknowledged === true ? "A" : "";
        var servicesdata = "";
        var serviceerror = false;
        for (serviceindex in hostdetail.services) {
            servicedetail = hostdetail.services[serviceindex];
            servicedetail.host = hostdetail;
            servicedetail.actions = chkimg + " " + ackimg;
            servicedetail.acknowledged = servicedetail.has_been_acknowledged === true ? "A" : "";
            servicedetail.initialhide = servicedetail.status === "OK" ? "display: none;" : "";
            serviceerror |= servicedetail.status !== "OK";
            servicesdata += servicetemplate(servicedetail);
        }
        hostdetail.initialhide = (serviceerror || hostdetail.status !== "UP") ? "" : "display: none;";
        hostdetail.servicesdata = servicesdata;
        largehtml += hosttemplate(hostdetail);
        delete(hostdetail.servicesdata);
        delete(hostdetail.style);
    }
    detailstable.html(largehtml);
});

self.port.on("show", function (output) {
    console.log("panel show");
});

var triggerRefresh = function() {
    self.port.emit("triggerRefresh");
}

var triggerCmdExec = function(e) {
    return;
    var i$ = $(e.target);
    var hostname = i$.parents('.host').find('.hostname').text();
    var servicename = i$.parents('.service').find('.servicename').text();

    self.port.emit("triggerCmdExec", {hostname: hostname, servicename: servicename, command: e.data.command});
}

var triggerOpenPage = function(e) {
    var i$ = $(e.target);
    self.port.emit("triggerOpenPage", i$.data("url"));
}

$(document).on('click', '.refresh', null, triggerRefresh);
$(document).on('click', '.recheck', {command: "recheck"}, triggerCmdExec);
$(document).on('click', '.ack', {command: "ack"}, triggerCmdExec);
$(document).on('click', '.hostname, .servicename', null, triggerOpenPage)

function filterInfos() {
    $('.hostcheckinfo').toggle($('#showhostdetails').prop('checked'));
    $('.service > .info').toggle($('#showservicedetails').prop('checked'));
}

function filterDetails(a) {
    // 0 => only problems
    if (a!=parseInt(a)) {
        a = parseInt($(this).data('filter'));
    }
    
    $('.host').each(function() {
        var host$ = $(this); 
        var serviceerror = false;
        host$.find('.service').each(function() {
            var serv$ = $(this);
            var servNotOk = serv$.find('.status').text() !== "OK"
            serv$.toggle(a > 1 || servNotOk);
            serviceerror |= servNotOk;
        });
        host$.toggle(a > 0 || serviceerror);
    });
    
    filterInfos();
}

$(document).on('click', '.btnFilterDetails', filterDetails);
$(document).on('click', 'input[type=checkbox]', filterInfos);*/