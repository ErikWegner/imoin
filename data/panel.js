var errortemplate = _.template($('#errortemplate').html());
var maintemplate = _.template($('#maintemplate').html());

self.port.on("ProcessStatusUpdate", function(status) {
    $('body').html(maintemplate(status));
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