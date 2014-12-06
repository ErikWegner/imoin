var port = 1080;

var http = require('http');

var bigresponse = {
      "cgi_json_version": "1.10.0",
      "status": {
          "host_status": [],
          "service_status": []
      }
  };
  var hostlimit = 2000;
  while (hostlimit-- > 0) {
      var servicelimit = 20;
      var hostname = "host" + hostlimit;
      bigresponse.status.host_status.push({"host_name": hostname, "host_display_name": hostname, "status": "UP", "last_check": "2014-07-10 21:43:53", "duration": "47d 23h 32m 40s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.07 ms"});
      while (servicelimit-- > 0) {
          var servicename = hostname + "s" + servicelimit;
          bigresponse.status.service_status.push({ "host_name": hostname, "host_display_name": hostname, "service_description": servicename, "service_display_name": servicename, "status": "OK", "last_check": "2014-07-10 21:20:10", "duration": "4d  9h 24m 45s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"});
      }
  }

var responsedata = JSON.stringify(bigresponse);

http.createServer(function (req, res) {
  console.log("answering");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(responsedata);
}).listen(port);

console.log("Server listening at " + port);
