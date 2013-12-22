/*jshint node:true, laxcomma:true */


var StatsdClient = function (config) {
     this.config = config;
     if (this.config.reportenabled == true) {
       var Statsd = require('node-statsd-client').Client;
       this.statsdClient = new Statsd(config.host, config.port);
     }
}


StatsdClient.prototype = {
  increment: function (postfix) {
    if (this.config.reportenabled == true) {
      var key = this.config.metricsprefix + "." +postfix;
      this.statsdClient.increment(key);
    }
};

exports.StatsdClient = StatsdClient;
