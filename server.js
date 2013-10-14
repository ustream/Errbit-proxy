var dgram = require("dgram"),
    AirbrakeNotice = require("airbrake-notice"),
    config = require('./lib/config');

var server = dgram.createSocket("udp4");
config.configFile(process.argv[2], function (config, oldConfig) {


server.on("error", function (err) {
  console.log("server error:\n" + err.stack);
  server.close();
});

server.on("message", function (msg, rinfo) {
  console.log("server got: " + msg + " from " +
    rinfo.address + ":" + rinfo.port);
});

server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(config.daemonport);

});

