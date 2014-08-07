var errortemplate = _.template($('#errortemplate').html());
var maintemplate = _.template($('#maintemplate').html());
var hosttemplate = _.template($('#hosttemplate').html());
var servicetemplate = _.template($('#servicetemplate').html());

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
    var chkimg = '<img src="rck.png" width="14" height="14" alt="Recheck" title="Recheck" />';
    var ackimg = '<img src="ack.png" width="14" height="14" alt="Acknowledge" title="Acknowledge" />';
    detailstable = $('#details');
    for (hostindex in dstatus.details) {
        hostdetail = dstatus.details[hostindex];
        // output the details for a host
        hostdetail.actions = chkimg + " " + ackimg;
        hostdetail.acknowledged = hostdetail.has_been_acknowledged === true ? "A" : "";
        detailstable.append(hosttemplate(hostdetail));
        hostdetail.el$ = detailstable.children().last();
        hostdetail.services$ = hostdetail.el$.find(".services");
        for (serviceindex in hostdetail.services) {
            servicedetail = hostdetail.services[serviceindex];
            servicedetail.host = hostdetail;
            servicedetail.actions = chkimg + " " + ackimg;
            servicedetail.acknowledged = servicedetail.has_been_acknowledged === true ? "A" : "";
            hostdetail.services$.append(servicetemplate(servicedetail));
            servicedetail.el$ = hostdetail.services$.children().last();
        }
    }
    filterDetails(0);
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

$(document).on('click', '.refresh', null, triggerRefresh);

function filterInfos() {
    $('.hostcheckinfo').toggle($('#showhostdetails').prop('checked'));
    $('.service > .info').toggle($('#showservicedetails').prop('checked'));
}

function filterDetails(a) {
    // 0 => only problems
    if (a!=parseInt(a)) {
        a = parseInt($(this).data('filter'));
    }
    
    var hostindex;
    var hostdetail;
    var serviceindex;
    var servicedetail;
    for (hostindex in dstatus.details) {
        hostdetail = dstatus.details[hostindex];
        var serviceerror = false;
        for (serviceindex in hostdetail.services) {
            servicedetail = hostdetail.services[serviceindex];
            servicedetail.el$.toggle(a > 1 || servicedetail.status !== "OK")
            serviceerror = serviceerror || servicedetail.status !== "OK";
        }
        hostdetail.el$.toggle(a > 0 || serviceerror);
    }
    
    filterInfos();
}

$(document).on('click', '.btnFilterDetails', filterDetails);
$(document).on('click', 'input[type=checkbox]', filterInfos);