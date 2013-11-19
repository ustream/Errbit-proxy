var dgram = require("dgram"),
    AirbrakeNotice = require("airbrake-notice"),
    logger = require('./lib/logger')
    errorparser = require('./lib/errorparser.js')
    config = require('./lib/config');

var server = dgram.createSocket("udp4");
config.configFile(process.argv[2], function (config, oldConfig) {
    l = new logger.Logger(config.log || {});
    parser = new errorparser.ErrorParser(config);

server.on("error", function (err) {
  l.log("server error:\n" + err.stack, 'ERROR');
  server.close();
});

server.on("message", function (msg, rinfo) {
 /* l.log("server got: " + msg + " from " +
    rinfo.address + ":" + rinfo.port, 'DEBUG');*/
    parser.forwardError(msg);
});

server.on("listening", function () {
  var address = server.address();
  l.log("server listening " +
      address.address + ":" + address.port, 'INFO');
});

server.bind(config.daemonport || 9999);

});

