var errortemplate = _.template($('#errortemplate').html());
var maintemplate = _.template($('#maintemplate').html());
var hosttemplate = _.template($('#hosttemplate').html());
var servicetemplate = _.template($('#servicetemplate').html());

//  global variables
var detailstable = null;
var hostcontainer = null;

function processServiceDetail(servicedetail) {
    // output the details for a service
    servicedetail.actions = "R A";
    servicedetail.acknowledged = servicedetail.has_been_acknowledged === true ? "A" : "";
    hostcontainer.append(servicetemplate(servicedetail));
}

function processHostDetail(hostdetail) {
    // output the details for a host
    hostdetail.actions = "R A";
    hostdetail.acknowledged = hostdetail.has_been_acknowledged === true ? "A" : "";
    detailstable.append(hosttemplate(hostdetail));
    hostcontainer = detailstable.find('.services').last();
    _(hostdetail.services).each(processServiceDetail);
}

self.port.on("ProcessStatusUpdate", function(status) {
    // this function refreshes the tables
    $('body').html(maintemplate(status));
    detailstable = $('#details');
    _(status.details).each(processHostDetail);
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

function filterDetails(a) {
    // 0 => only problems
    if (a!=parseInt(a)) {
        a = parseInt($(this).text());
    }
    
    function showParentHost() {
        $(this).parent().parent().find(".level1").show();
    }
    
    $('.level4').hide();
    $('.level2').hide();
    $('.level1').hide();
    detailstable.find(".service > .status").filter(function(e) {return !$(this).hasClass("OK")}).parent().show().each(showParentHost).find('.level4').show();
    detailstable.find(".host > .status").filter(function(e) {return !e.hasClass("OK")}).show();
    
    if (a > 0) {
        $('.level1').show();
        if (a > 1) {
            $('.level2').show();
            if (a > 2) {$('.level4').show();}
        }
    }
}

$(document).on('click', '.btnFilterDetails', filterDetails);