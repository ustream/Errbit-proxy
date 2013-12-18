/*jshint node:true, laxcomma:true */

var ErrorParser = function (config, logger, statsdclient) {
     this.config = config;
     this.logger = logger;
     this.statsdclient = statsdclient;

}


ErrorParser.prototype = {
  forwardError: function (err, assembler) {
    that = this;
    var message = err.toString();
    try {
      var fragment = JSON.parse(err);
      var assembled = assembler.reassemble(fragment);
      if (assembled == false) {
        this.logger.log("UDP Fragment successfully stored, waiting for other fragments to arrive");
        return;
      } else {
        this.logger.log("UDP Fragment successfully reassembled, forwarding to Errbit.");
        message = assembled;
      }
    } catch (e) {
       //this wasnt a json, we may continue
    }
    var postRequest = {
      host: that.config.host,
      path: "/notifier_api/v"+that.config.apiversion+"/notices",
      port: that.config.port,
      method: "POST",
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(message)
      }
    };

    var buffer = "";
    if(that.config.proto == "http") {
      var http = require("http");
    } else {
      var http = require("https");
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    

    var req = http.request( postRequest, function( res )    {

      res.statusCode;
      var buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) {
        if (res.statusCode == 200) {
          that.logger.log("exception delivered");
          if(that.config.statsd.reportenabled == true) {
            that.statsdclient.increment(that.config.statsd.metricsprefix + ".errbit.proxy.delivery.ok");
          }
        } else {
          that.logger.log("Delivery failed. Errbit said :"+buffer);
          if(that.config.statsd.reportenabled == true) {
            that.statsdclient.increment(that.config.statsd.metricsprefix + ".errbit.proxy.delivery.err");
          }

        }
         } );

    });

    req.write(message);
    req.end();
   }
};

exports.ErrorParser = ErrorParser;
