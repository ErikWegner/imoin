
var statusurl = "";

var StatusUrlChanged = function(newurl) {
    console.log("StatusUrlChanged");
    statusurl = newurl;
}

exports.StatusUrlChanged = StatusUrlChanged;


var RefreshStatusTriggered = function() {
    console.log("RefreshStatus triggered");
    
}

exports.RefreshStatusTriggered = RefreshStatusTriggered;