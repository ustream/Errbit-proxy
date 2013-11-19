/*jshint node:true, laxcomma:true */
var http = require("http");


var ErrorParser = function (config) {
     this.config = config;
     this.util = require('util');

}


ErrorParser.prototype = {
  forwardError: function (err) {
    that = this;
    var message = err.toString();
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
