var errortemplate = _.template($('#errortemplate').html());
var maintemplate = _.template($('#maintemplate').html());
var hosttemplate = _.template($('#hosttemplate').html());
var servicetemplate = _.template($('#servicetemplate').html());

//  global variables
var detailstable = null;
var servicecssclasseven = false;

function processServiceDetail(servicedetail) {
    // output the details for a service
    servicedetail.actions = "R A";
    servicedetail.acknowledged = servicedetail.has_been_acknowledged === true ? "A" : "";
    servicedetail.trcssclass = servicecssclasseven ? "even" : "odd";
    detailstable.append(servicetemplate(servicedetail));
    servicecssclasseven = !servicecssclasseven;
}

function processHostDetail(hostdetail) {
    // output the details for a host
    hostdetail.actions = "R A";
    hostdetail.acknowledged = hostdetail.has_been_acknowledged === true ? "A" : "";
    detailstable.append(hosttemplate(hostdetail));
    _(hostdetail.services).each(processServiceDetail);
}

self.port.on("ProcessStatusUpdate", function(status) {
    // this function refreshes the tables
    $('body').html(maintemplate(status));
    detailstable = $('table#details');
    _(status.details).each(processHostDetail);
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