const express = require('express')
const app = express()
const fs = require('fs');
const path = require('path');

app.get('/', (req, res) => res.send('Demo server for Icinga and Nagios!'))

fs.readFile('test/data/nagioscore/hostlist.json', (err, hostlist) => {
  if (err) {
    throw err;
  }
  fs.readFile('test/data/nagioscore/servicelist.json', (err, servicelist) => {
    if (err) {
      throw err;
    }
    app.get('/nagioscore/cgi-bin/statusjson.cgi', (req, res) => {
      res.set('Content-Type', 'application/json');      
      if (req.query.query === 'hostlist') {res.send(hostlist); return }
      if (req.query.query === 'servicelist'){ res.send(servicelist); return }
      res.status(404).end();      
    });
  });
});

app.get('/icingaapi/v1/objects/hosts', (req, res) => {
  res.sendFile(path.resolve('./test/data/icinga2/hosts.json'));
})

app.get('/icingaapi/v1/objects/services', (req, res) => {
  res.sendFile(path.resolve('./test/data/icinga2/services.json'));
})

app.listen(3000, () => console.log('Demo server listening on port 3000!'))
