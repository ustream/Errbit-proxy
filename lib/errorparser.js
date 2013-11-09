/*jshint node:true, laxcomma:true */

var ErrorParser = function (lofasz) {
     this.util = require('util');
}


ErrorParser.prototype = {
  validateError: function (err) {
    this.util.log(err);
    this.util.log("Malformed exception: "+err, 'ERROR');
  }
};

exports.ErrorParser = ErrorParser;
