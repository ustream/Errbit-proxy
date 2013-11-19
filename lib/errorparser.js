/*jshint node:true, laxcomma:true */
var AirbrakeNotice = require("airbrake-notice");
var parseString = require('xml2js').parseString;
var http = require("http");


var ErrorParser = function (config) {
     this.config = config;
     var version = "2.3";
  	 this.notice = AirbrakeNotice(version);
}


ErrorParser.prototype = {
  forwardError: function (err) {
    that = this;
    parseString(err, function (error, result) {
      var message = that.notice.create({
          "apiKey": result.notice['api-key'],
          "notifier": {
            "name": 'Errbit-Proxy',
            "version": '0.1',
            "url": 'http://errbit-proxy.github.io'
          },
         "error": result.notice.error[0],
         "request": result.notice.request[0],
         "serverEnvironment": result.notice['server-environment'][0]
        });
      console.log(message);
       var postRequest = {
              host: that.config.host,
              path: "/notifier_api/v2/notices",
              port: that.config.port,
              method: "POST",
              headers: {
                  'Content-Type': 'text/xml',
                  'Content-Length': Buffer.byteLength(message)
              }
          };

      var buffer = "";

      var req = http.request( postRequest, function( res )    {

      console.log( res.statusCode );
      var buffer = "";
      res.on( "data", function( data ) { buffer = buffer + data; } );
      res.on( "end", function( data ) { console.log( buffer ); } );

      });

      req.write(message);
      req.end();
    });

   }
};

exports.ErrorParser = ErrorParser;
