var errortemplate = _.template($('#errortemplate').html().replace(/&lt;/g,"<").replace(/&gt;/g,">"));
var maintemplate = _.template($('#maintemplate').html().replace(/&lt;/g,"<").replace(/&gt;/g,">"));
var hosttemplate = _.template($('#hosttemplate').html().replace(/&lt;/g,"<").replace(/&gt;/g,">"));
var servicetemplate = _.template($('#servicetemplate').html().replace(/&lt;/g,"<").replace(/&gt;/g,">"));

//  global variables
var detailstable = null;
var dstatus = null;

self.port.on("ProcessStatusUpdate", function(status) {
    // this function refreshes the tables
    $('body').html(maintemplate(status));
    
    dstatus = status;
    var hostcontainer = null;
    var hostindex;
    var hostdetail;
    var serviceindex;
    var servicedetail;
    var chkimg = '<img src="rck.png" width="14" height="14" alt="Recheck" title="Recheck" class="recheck" />';
    var ackimg = '<img src="ack.png" width="14" height="14" alt="Acknowledge" title="Acknowledge" class="ack" />';
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

self.port.on("GenericError", function(message) {
   $('body').html(errortemplate({message: message}));
});

self.port.on("show", function (output) {
    self.port.emit("resize", document.documentElement.scrollWidth, document.documentElement.scrollHeight);
});

var triggerRefresh = function() {
    self.port.emit("triggerRefresh");
}

var triggerCmdExec = function(e) {
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
$(document).on('click', 'input[type=checkbox]', filterInfos);