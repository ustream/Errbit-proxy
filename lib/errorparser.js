/*jshint node:true, laxcomma:true */
var http = require("http");


var ErrorParser = function (config) {
     this.config = config;
     this.util = require('util');

}


ErrorParser.prototype = {
  forwardError: function (err, assembler) {
    that = this;
    var message = err.toString();
    try {
      var fragment = JSON.parse(err);
      var assembled = assembler.reassemble(fragment);
      if (assembled == false) {
        this.util.log("UDP Fragment successfully stored, waiting for other fragments to arrive");
        return;
      } else {
        this.util.log("UDP Fragment successfully reassembled, forwarding to Errbit.");
        message = assembled;
      }
    } catch (e) {
       //This wasn't json, we may continue
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

    var req = http.request( postRequest, function( res )    {

      res.statusCode;
      var buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) {
        if (res.statusCode == 200) {
          that.util.log("exception delivered");
        } else {
          that.util.log("Delivery failed. Errbit said :"+buffer);
        }
         } );

    });

    req.write(message);
    req.end();
   }
};

exports.ErrorParser = ErrorParser;
