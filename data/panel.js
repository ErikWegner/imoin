var errortemplate = _.template($('#errortemplate').html());
var maintemplate = _.template($('#maintemplate').html());

self.port.on("ProcessStatusUpdate", function(status) {
    console.log("Panel ProcessStatusUpdate");
    console.log(status);
    $('body').html(maintemplate(status));
});

self.port.on("GenericError", function(message) {
   $('body').html(errortemplate({message: message}));
});

var triggerRefresh = function() {
    console.log("Panel trigger refresh");
    self.port.emit("triggerRefresh");
}

$(document).on('click', '.refresh', null, triggerRefresh);