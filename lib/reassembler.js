/*jshint node:true, laxcomma:true */

var Reassembler = function () {
     this.fragments = new Array()
}


Reassembler.prototype = {
  reassemble: function (fragment) {
    this.fragments;
    if(!(fragment.messageid in this.fragments)) {
      this.fragments[fragment.messageid] = fragment;

    } else {
      this.fragments[fragment.messageid].data += fragment.data;
    }
    if (fragment.last) {
        var complete = this.fragments[fragment.messageid].data;
        delete this.fragments[fragment.messageid];
        return complete;
    } else {
      return false;
    }

  }
};

exports.Reassembler = Reassembler;
