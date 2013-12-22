var dgram = require("dgram"),
    logger = require('./lib/logger')
    errorparser = require('./lib/errorparser')
    config = require('./lib/config')
    statsd = require('./lib/statsd')
    reassembler = require('./lib/reassembler');

config.configFile(process.argv[2], function (config, oldConfig) {
    l = new logger.Logger(config.log || {});
    statsdClient = new statsd.StatsdClient(config.statsd);
    Reassembler = new reassembler.Reassembler(statsdClient);
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

