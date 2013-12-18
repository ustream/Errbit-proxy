var dgram = require("dgram"),
    logger = require('./lib/logger')
    errorparser = require('./lib/errorparser')
    config = require('./lib/config')
    reassembler = require('./lib/reassembler');
    Statsd = require('node-statsd-client').Client;

config.configFile(process.argv[2], function (config, oldConfig) {
    l = new logger.Logger(config.log || {});
    statsdClient = new Statsd(config.statsd.host, config.statsd.port);
    Reassembler = new reassembler.Reassembler(config, statsdClient);
    parser = new errorparser.ErrorParser(config, l, statsdClient);


var server = dgram.createSocket("udp4");

server.on("error", function (err) {
  l.log("server error:\n" + err.stack, 'ERROR');
  server.close();
});

server.on("message", function (msg, rinfo) {
    parser.forwardError(msg, Reassembler);
});

server.on("listening", function () {
  var address = server.address();
  l.log("server listening " +
      address.address + ":" + address.port, 'INFO');
});

server.bind(config.daemonport || 9999);

var the_interval = (config.purgerinterval || 60) * 1000;
setInterval(function() {
  l.log("Clearing incomplete objects from reassembler cache", 'INFO');
  Reassembler.cleanmemory();
}, the_interval);


});

