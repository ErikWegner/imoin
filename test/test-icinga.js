var g = 0;

var redservicejson = { "cgi_json_version": "1.10.0",
"icinga_status": {
"status_data_age": 2,
"status_update_interval": 10,
"reading_status_data_ok": true,
"program_version": "1.10.2",
"icinga_pid": 2556,
"timezone": "CEST",
"date_format": "iso8601",
"program_start": 1402568135,
"total_running_time": "28d 9h 29m 20s",
"last_external_command_check": 1405021492,
"last_log_file_rotation": 1404943200,
"notifications_enabled": true,
"disable_notifications_expire_time": 0,
"service_checks_being_executed": true,
"passive_service_checks_being_accepted": true,
"host_checks_being_executed": true,
"passive_host_checks_being_accepted": true,
"obsessing_over_services": false,
"obsessing_over_hosts": false,
"check_service_freshness": true,
"check_host_freshness": false,
"event_handlers_enabled": true,
"flap_detection_enabled": true,
"performance_data_being_processed": true
}, 
"status": {
"host_status": [
{ "host_name": "host1", "host_display_name": "host1", "status": "UP", "last_check": "2014-07-10 21:43:53", "duration": "47d 23h 32m 40s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.07 ms"},
{ "host_name": "host2", "host_display_name": "host2", "status": "UP", "last_check": "2014-07-10 21:41:03", "duration": "691d  5h 40m 52s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "OK"},
{ "host_name": "host3", "host_display_name": "host3", "status": "UP", "last_check": "2014-07-10 21:41:43", "duration": "0d  0h 18m 32s", "attempts": "1/10", "state_type": "HARD", "is_flapping": true, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.33 ms"},
{ "host_name": "host4", "host_display_name": "host4", "status": "UP", "last_check": "2014-07-10 21:41:13", "duration": "0d  0h  3m 32s", "attempts": "1/10", "state_type": "SOFT", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 1.37 ms"},
{ "host_name": "host5", "host_display_name": "host5", "status": "UP", "last_check": "2014-07-10 21:41:13", "duration": "0d  1h 21m  2s", "attempts": "1/10", "state_type": "HARD", "is_flapping": true, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.31 ms"},
{ "host_name": "host6", "host_display_name": "host6", "status": "UP", "last_check": "2014-07-10 21:40:13", "duration": "1d  2h 15m 32s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 28%, RTA = 18.97 ms"},
{ "host_name": "host7", "host_display_name": "host7", "status": "UP", "last_check": "2014-07-10 21:40:33", "duration": "20d 10h  4m 57s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 30.27 ms"},
{ "host_name": "host8", "host_display_name": "host8", "status": "UP", "last_check": "2014-07-10 21:41:33", "duration": "5d  8h 58m 27s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 30.18 ms"},
{ "host_name": "localhost", "host_display_name": "localhost", "status": "UP", "last_check": "2014-07-10 21:42:33", "duration": "560d  1h 55m 18s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.31 ms"},
{ "host_name": "host9", "host_display_name": "host9", "status": "UP", "last_check": "2014-07-10 21:40:13", "duration": "20d 10h  5m 17s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 30.32 ms"},
{ "host_name": "hosta", "host_display_name": "hosta", "status": "UP", "last_check": "2014-07-10 21:43:33", "duration": "6d 23h 25m 47s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.06 ms"},
{ "host_name": "hostb", "host_display_name": "hostb", "status": "UP", "last_check": "2014-07-10 21:40:43", "duration": "20d 10h  4m 37s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 30.22 ms"}
]
,
"service_status": [
{ "host_name": "host1", "host_display_name": "host1", "service_description": "Drupal", "service_display_name": "Drupal", "status": "OK", "last_check": "2014-07-10 21:20:10", "duration": "4d  9h 24m 45s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"},
{ "host_name": "host1", "host_display_name": "host1", "service_description": "HTTP", "service_display_name": "HTTP", "status": "OK", "last_check": "2014-07-10 21:44:48", "duration": "1d  2h  0m  7s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 200 OK - 43727 bytes in 0.088 second response time"},
{ "host_name": "host1", "host_display_name": "host1", "service_description": "SSL-Zertifikat", "service_display_name": "SSL-Zertifikat", "status": "OK", "last_check": "2014-07-10 12:45:37", "duration": "232d  7h  5m 36s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "SSL_CERT OK - X.509 certificate for 'qwirl.eu' from 'CA Cert Signing Authority' valid until Oct  6 19:00:58 2014 GMT"},
{ "host_name": "host2", "host_display_name": "host2", "service_description": "Festplatten", "service_display_name": "Festplatten", "status": "OK", "last_check": "2014-07-10 21:30:29", "duration": "4d  4h 14m 26s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DISK OK"},
{ "host_name": "host6", "host_display_name": "host6", "service_description": "Erwartete Access Points", "service_display_name": "Erwartete Access Points", "status": "OK", "last_check": "2014-07-10 21:40:27", "duration": "9d 21h  4m 28s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "SNMP OK - 3"},
{ "host_name": "host6", "host_display_name": "host6", "service_description": "PING", "service_display_name": "PING", "status": "OK", "last_check": "2014-07-10 21:42:31", "duration": "0d  0h  7m 24s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "PING OK - Packet loss = 16%, RTA = 17.88 ms"},
{ "host_name": "host6", "host_display_name": "host6", "service_description": "Unbekannte Access Points", "service_display_name": "Unbekannte Access Points", "status": "OK", "last_check": "2014-07-10 21:31:17", "duration": "0d  2h 13m 38s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "SNMP OK - 0"},
{ "host_name": "host6", "host_display_name": "host6", "service_description": "Verbundene Access Points", "service_display_name": "Verbundene Access Points", "status": "OK", "last_check": "2014-07-10 21:41:21", "duration": "0d  1h  8m 34s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "SNMP OK - 3"},
{ "host_name": "host7", "host_display_name": "host7", "service_description": "Drupal", "service_display_name": "Drupal", "status": "OK", "last_check": "2014-07-10 20:46:12", "duration": "0d 11h 58m 43s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"},
{ "host_name": "host7", "host_display_name": "host7", "service_description": "HTTP", "service_display_name": "HTTP", "status": "OK", "last_check": "2014-07-10 21:40:11", "duration": "1d  2h  9m 44s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 302 Found - 561 bytes in 0.263 second response time"},
{ "host_name": "host8", "host_display_name": "host8", "service_description": "HTTP", "service_display_name": "HTTP", "status": "OK", "last_check": "2014-07-10 21:41:16", "duration": "5d  8h 53m 45s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 302 Found - 280 bytes in 0.065 second response time"},
{ "host_name": "host8", "host_display_name": "host8", "service_description": "WordPress", "service_display_name": "WordPress", "status": "OK", "last_check": "2014-07-10 20:50:07", "duration": "26d 19h 54m 48s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 200 OK - 58961 bytes in 0.420 second response time"},
{ "host_name": "host8", "host_display_name": "host8", "service_description": "WordPress Uptodate", "service_display_name": "WordPress Uptodate", "status": "OK", "last_check": "2014-07-10 21:28:57", "duration": "56d 16h 46m 27s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "Running 3.9.1 is fine."},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Current Load", "service_display_name": "Current Load", "status": "OK", "last_check": "2014-07-10 21:40:11", "duration": "9d  0h 44m 56s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "OK - load average: 0.21, 0.15, 0.17"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Current Users", "service_display_name": "Current Users", "status": "OK", "last_check": "2014-07-10 21:44:00", "duration": "691d  5h 46m 14s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "USERS OK - 0 users currently logged in"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "HTTP", "service_display_name": "HTTP", "status": "OK", "last_check": "2014-07-10 21:42:51", "duration": "23d 15h 27m  4s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 301 Moved Permanently - 253 bytes in 0.002 second response time"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Icinga Startup Delay", "service_display_name": "Icinga Startup Delay", "status": "OK", "last_check": "2014-07-10 21:40:11", "duration": "691d  5h 56m 11s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": false, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "OK: Icinga started with 2 seconds delay"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Kerstin", "service_display_name": "Kerstin", "status": "OK", "last_check": "2014-07-10 18:49:47", "duration": "240d  7h 11m 46s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 200 OK - 578 bytes in 0.021 second response time"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "MySQL Connection time", "service_display_name": "MySQL Connection time", "status": "OK", "last_check": "2014-07-10 21:43:49", "duration": "23d 15h 26m  8s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "OK - 0.04 seconds to connect as icinga"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "OpenSlides", "service_display_name": "OpenSlides", "status": "OK", "last_check": "2014-07-10 18:40:37", "duration": "147d 23h 51m 58s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 200 OK - 4055 bytes in 0.186 second response time"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "PING", "service_display_name": "PING", "status": "OK", "last_check": "2014-07-10 21:40:48", "duration": "691d  5h 52m 40s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.05 ms"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Postfix", "service_display_name": "Postfix", "status": "OK", "last_check": "2014-07-10 21:41:29", "duration": "392d 23h 53m 55s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "postfix.service - Postfix Mail Transport Agent"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Redmine", "service_display_name": "Redmine", "status": "OK", "last_check": "2014-07-10 21:35:29", "duration": "5d 23h 39m 26s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 200 OK - 3713 bytes in 0.059 second response time"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Root Partition", "service_display_name": "Root Partition", "status": "OK", "last_check": "2014-07-10 21:41:30", "duration": "597d 10h 36m  8s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DISK OK - free space: / 100822 MB (65% inode=21%):"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "SSH", "service_display_name": "SSH", "status": "OK", "last_check": "2014-07-10 21:42:19", "duration": "132d  9h 15m 16s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": false, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "SSH OK - OpenSSH_6.0 (protocol 2.0)"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "SSL-Zertifikat", "service_display_name": "SSL-Zertifikat", "status": "OK", "last_check": "2014-07-10 12:42:17", "duration": "329d 11h 43m 20s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "SSL_CERT OK - X.509 certificate for 'qwirl.eu' from 'CA Cert Signing Authority' valid until Oct  6 19:00:58 2014 GMT"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "Total Processes", "service_display_name": "Total Processes", "status": "OK", "last_check": "2014-07-10 21:42:19", "duration": "691d  5h 36m 35s", "attempts": "1/4", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "PROCS OK: 40 processes with STATE = RSZDT"},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "WordPress", "service_display_name": "WordPress", "status": "CRITICAL", "last_check": "2014-07-10 21:41:07", "duration": "0d  2h  7m 48s", "attempts": "3/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "Need attention! Core is up-to-date. - 2 plugins are out-of-date! - Themes are up-to-date."},
{ "host_name": "localhost", "host_display_name": "localhost", "service_description": "ido2db Process", "service_display_name": "ido2db Process", "status": "OK", "last_check": "2014-07-10 21:43:09", "duration": "88d  8h 59m 30s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": null, "notes_url": null, "status_information": "PROCS OK: 2 processes with command name 'ido2db'"},
{ "host_name": "host9", "host_display_name": "host9", "service_description": "Drupal", "service_display_name": "Drupal", "status": "OK", "last_check": "2014-07-10 21:32:52", "duration": "0d 17h 12m  3s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"},
{ "host_name": "host9", "host_display_name": "host9", "service_description": "HTTP", "service_display_name": "HTTP", "status": "OK", "last_check": "2014-07-10 21:40:00", "duration": "1d  2h  9m 55s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 200 OK - 9698 bytes in 0.291 second response time"},
{ "host_name": "hosta", "host_display_name": "hosta", "service_description": "DRUPAL Qwirl", "service_display_name": "DRUPAL Qwirl", "status": "OK", "last_check": "2014-07-10 20:26:53", "duration": "13d 17h 18m  2s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"},
{ "host_name": "hosta", "host_display_name": "hosta", "service_description": "DRUPAL THW", "service_display_name": "DRUPAL THW", "status": "OK", "last_check": "2014-07-10 20:35:44", "duration": "1d  9h  9m 11s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"},
{ "host_name": "hosta", "host_display_name": "hosta", "service_description": "HTTP", "service_display_name": "HTTP", "status": "OK", "last_check": "2014-07-10 21:40:51", "duration": "1d  2h 14m  4s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 301 Moved Permanently - 253 bytes in 0.003 second response time"},
{ "host_name": "hostb", "host_display_name": "hostb", "service_description": "Drupal", "service_display_name": "Drupal", "status": "OK", "last_check": "2014-07-10 20:58:47", "duration": "1d  4h 46m  8s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"},
{ "host_name": "hostb", "host_display_name": "hostb", "service_description": "HTTP", "service_display_name": "HTTP", "status": "OK", "last_check": "2014-07-10 21:41:51", "duration": "1d  2h 13m  4s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "HTTP OK: HTTP/1.1 200 OK - 45713 bytes in 0.276 second response time"}
]
}
}


var response_1_6 = { "cgi_json_version": "1.6.0",
"status": {
"host_status": [
{ "host": "test", "service": "Cron", "status": "OK", "last_check": "2014-08-29 12:00:05", "duration": "3d  1h  2m 43s", "attempts": "1/4", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "status_information": "FILE_AGE OK: /tmp/cronmonitor is 304 seconds old and 0 bytes"},
{ "host": "test", "service": "Disks", "status": "OK", "last_check": "2014-08-29 11:59:22", "duration": "3d  1h  4m 49s", "attempts": "1/4", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "status_information": "DISK OK - free space: / 35657 MB (87% inode=99%): /dev/shm 8037 MB (100% inode=99%): /boot 97 MB (75% inode=99%):"},
{ "host": "test", "service": "Server", "status": "OK", "last_check": "2014-08-29 12:02:05", "duration": "1d 22h  6m 26s", "attempts": "1/4", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "status_information": "SERVER OK"},
{ "host": "test", "service": "Load", "status": "OK", "last_check": "2014-08-29 11:59:18", "duration": "3d  1h  4m 12s", "attempts": "1/4", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "status_information": "OK - load average: 0.34, 0.19, 0.17"},
{ "host": "test", "service": "Memory", "status": "OK", "last_check": "2014-08-29 11:59:23", "duration": "3d  1h  5m 34s", "attempts": "1/4", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "status_information": "Memory: OK Total: 16075 MB - Used: 2848 MB - 17% used"}
]
}
}


exports["test ProcessResponseAllGreen"] = function(assert, done) {
    var EventNames = {
        InstanceUrlChanged: "InstanceUrlChanged",
        QueryStatus: "QueryStatus",
        Unconfigured: "Unconfigured",
        GenericError: "GenericError",
        ProcessResponse: "ProcessResponse",
        StatusUpdate: "StatusUpdate"
    };
    var { on, once, off, emit } = require('sdk/event/core');
    var target = { name: 'imointarget' };
    var icinga = require("./icinga");
    icinga.SetEventTransport(target);
    icinga.SetEventNames(EventNames);

    once(target, EventNames.GenericError, function(m) {
       assert.fail(m);
       done();
    });
    

    once(target, EventNames.StatusUpdate, function(status) {
        assert.pass("StatusUpdate");
        assert.equal(typeof status, "object", "status is an object");
        assert.equal(typeof status.details, "object", "status.details is an object");
        var i1 = 0, i2 = 0;
        for (i1 in status.details) {
            i2++;
        }
        assert.equal(i2, status.totalhosts, "test totalhosts matches details length");
        done();
    });
    
    icinga.ProcessResponse(redservicejson);
}

exports["test ProcessResponse_1_6"] = function(assert, done) {
    var EventNames = {
        InstanceUrlChanged: "InstanceUrlChanged",
        QueryStatus: "QueryStatus",
        Unconfigured: "Unconfigured",
        GenericError: "GenericError",
        ProcessResponse: "ProcessResponse",
        StatusUpdate: "StatusUpdate"
    };
    var { on, once, off, emit } = require('sdk/event/core');
    var target = { name: 'imointarget' };
    var icinga = require("./icinga");
    icinga.SetEventTransport(target);
    icinga.SetEventNames(EventNames);

    once(target, EventNames.GenericError, function(m) {
       assert.fail(m);
       done();
    });
    
    once(target, EventNames.StatusUpdate, function(status) {
        assert.pass("StatusUpdate");
        assert.equal(typeof status, "object", "status is an object");
        assert.equal(typeof status.details, "object", "status.details is an object");
        var i1 = 0, i2 = 0;
        for (i1 in status.details) {
            i2++;
        }
        assert.equal(i2, status.totalhosts, "test totalhosts matches details length");
        assert.equal(i2, 1, "test totalhosts matches 1");
        done();
    });
    
    icinga.ProcessResponse(response_1_6);
}

// ca. 3160 Services und 470 Hosts
exports["test huge response"] = function(assert, done) {
    var starttime = (new Date()).getTime();
    var EventNames = {
        InstanceUrlChanged: "InstanceUrlChanged",
        QueryStatus: "QueryStatus",
        Unconfigured: "Unconfigured",
        GenericError: "GenericError",
        ProcessResponse: "ProcessResponse",
        StatusUpdate: "StatusUpdate"
    };
    var { on, once, off, emit } = require('sdk/event/core');
    var target = { name: 'imointarget' };
    var icinga = require("./icinga");
    icinga.SetEventTransport(target);
    icinga.SetEventNames(EventNames);

    once(target, EventNames.GenericError, function(m) {
       assert.fail(m);
       done();
    });
    

    once(target, EventNames.StatusUpdate, function(status) {
        assert.pass("StatusUpdate");
        assert.equal(typeof status, "object", "status is an object");
        assert.equal(typeof status.details, "object", "status.details is an object");
        assert.equal(500, status.totalhosts, "test totalhosts matches 500");
        assert.equal(500*15, status.totalservices, "test totalservices matches");
        var endtime = (new Date()).getTime();
        console.log("Duration: " + (endtime - starttime));
        assert.ok(endtime - starttime < 200, "Fast enough");
        done();
    });
    
    var bigresponse = {
        "cgi_json_version": "1.10.0",
        "status": {
            "host_status": [],
            "service_status": []
        }
    };
    var hostlimit = 500;
    while (hostlimit-- > 0) {
        var servicelimit = 15;
        var hostname = "host" + hostlimit;
        bigresponse.status.host_status.push({"host_name": hostname, "host_display_name": hostname, "status": "UP", "last_check": "2014-07-10 21:43:53", "duration": "47d 23h 32m 40s", "attempts": "1/10", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=_HOST_", "notes_url": null, "status_information": "PING OK - Packet loss = 0%, RTA = 0.07 ms"});
        while (servicelimit-- > 0) {
            var servicename = hostname + "s" + servicelimit;
            bigresponse.status.service_status.push({ "host_name": hostname, "host_display_name": hostname, "service_description": servicename, "service_display_name": servicename, "status": "OK", "last_check": "2014-07-10 21:20:10", "duration": "4d  9h 24m 45s", "attempts": "1/3", "state_type": "HARD", "is_flapping": false, "in_scheduled_downtime": false, "active_checks_enabled": true, "passive_checks_enabled": true, "notifications_enabled": true, "has_been_acknowledged": false, "action_url": "/pnp/graph?host=$HOSTNAME$&srv=$SERVICEDESC$' class='tips' rel='/pnp/popup?host=$HOSTNAME$&srv=$SERVICEDESC$", "notes_url": null, "status_information": "DRUPAL OK, ADMIN:OK=No known issues at this time., CRON:OK"});
        }
    }
    
    icinga.ProcessResponse(bigresponse);
}

require("sdk/test").run(exports);
