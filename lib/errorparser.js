/*jshint node:true, laxcomma:true */

var ErrorParser = function (config, logger, statsdClient) {
     this.config = config;
     this.logger = logger;
     this.statsdClient = statsdClient;

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
        except = assembled;
      }
    } catch (e) {
       //this wasnt a json, we may continue
      var except = new Array();
      except['data'] = message;
      except['createdat'] = Date.now();
    }
    var postRequest = {
      host: that.config.host,
      path: "/notifier_api/v"+that.config.apiversion+"/notices",
      port: that.config.port,
      method: "POST",
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(except.data)
      }
    };

    var buffer = "";
    if(that.config.proto == "http") {
      var http = require("http");
    } else {
      var http = require("https");
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }


    var req = http.request( postRequest, function( res ) {

      res.statusCode;
      var buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) {
        if (res.statusCode == 200) {
          that.logger.log("exception delivered");
          that.statsdClient.increment("errbit.proxy.delivery.ok");
        } else {
          that.logger.log("Delivery failed. Errbit said :"+buffer);
          that.statsdClient.increment("errbit.proxy.delivery.err");
        }
         } );

    });
    if((Date.now() - except.completedAt) / 1000 > 60) {
      req.write(except.data);
    } else {
       that.logger.log("exception too old, ignoring.");
       that.statsdClient.increment("errbit.proxy.delivery.ignore");
    }
    req.end();
   }
};

exports.ErrorParser = ErrorParser;
