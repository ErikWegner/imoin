const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const logger = require('pino')({ level: 'debug' });

app.get('/', (_, res) => res.send('Demo server for Icinga and Nagios!'));

app.post('/log', express.json(), (req, res) => {
  const logEntry =
    JSON.stringify({ timestamp: new Date().toISOString(), ...req.body }) + '\n';
  const loglevel = req.body.level;
  const message = req.body.message;
  const additionalData = { ...req.body };
  delete additionalData.level;
  delete additionalData.message;
  if (loglevel == 'debug') {
    logger.debug(additionalData, message);
  } else if (loglevel == 'error') {
    logger.error(additionalData, message);
  } else {
    logger.info(additionalData, message);
  }
  fs.appendFile('logs.txt', logEntry, (err) => {
    if (err) {
      logger.error(err, 'Error writing log entry:');
      throw err;
    }
  });
  res.json({ status: 'success' }).end();
});

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
      if (req.query.query === 'hostlist') {
        res.send(hostlist);
        return;
      }
      if (req.query.query === 'servicelist') {
        res.send(servicelist);
        return;
      }
      res.status(404).end();
    });
  });
});

app.get('/icingaapi/v1/objects/hosts', (req, res) => {
  logger.debug('Serving Icinga hosts');
  res.sendFile(path.resolve('./test/data/icinga2/hosts.json'));
});

app.get('/icingaapi/v1/objects/services', (req, res) => {
  logger.debug('Serving Icinga services');
  res.sendFile(path.resolve('./test/data/icinga2/services.json'));
});

app.listen(3000, () => logger.info('Demo server listening on port 3000!'));
