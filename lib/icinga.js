var Request = require("sdk/request").Request;

var statusurl = "";

var StatusUrlChanged = function(newurl) {
    console.log("StatusUrlChanged");
    statusurl = newurl;
}

exports.StatusUrlChanged = StatusUrlChanged;


var RefreshStatusTriggered = function() {
    console.log("RefreshStatus triggered");
    console.log("url: " + statusurl + "?jsonoutput");
    Request({
        url: statusurl + "?jsonoutput",
        //overrideMimeType: "text/plain; charset=utf8",
        onComplete: function(response) {
            if (response.status != 200) {
		console.log(response.text);
            } else {
                for (var headerName in response.headers) {
                    console.log(headerName + " : " + response.headers[headerName]);
                }
                console.log(JSON.stringify(response.json));
            }
        }
    }).get();
}

exports.RefreshStatusTriggered = RefreshStatusTriggered;