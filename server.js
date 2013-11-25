var dgram = require("dgram"),
    logger = require('./lib/logger')
    errorparser = require('./lib/errorparser')
    config = require('./lib/config');
    reassembler = require('./lib/reassembler');

var server = dgram.createSocket("udp4");
var reassembler = new reassembler.Reassembler();

config.configFile(process.argv[2], function (config, oldConfig) {
    l = new logger.Logger(config.log || {});
    parser = new errorparser.ErrorParser(config, l);

server.on("error", function (err) {
  l.log("server error:\n" + err.stack, 'ERROR');
  server.close();
});

server.on("message", function (msg, rinfo) {
    parser.forwardError(msg, reassembler);
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
  reassembler.cleanmemory();
}, the_interval);


});

