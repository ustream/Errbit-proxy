/*jshint node:true, laxcomma:true */

var Reassembler = function (statsdclient) {
     this.fragments = new Array();
     this.statsdclient = statsdclient;
}


Reassembler.prototype = {
  reassemble: function (fragment) {
    fragment.createdat = Date.now();
    if(!(fragment.messageid in this.fragments)) {
      this.fragments[fragment.messageid] = fragment;
      this.statsdclient.increment("errbit.proxy.incomplete.new");
    } else {
      this.fragments[fragment.messageid].data += fragment.data;
      this.statsdclient.increment("errbit.proxy.incomplete.append");
    }
    if (fragment.last) {
        var complete = this.fragments[fragment.messageid]
        delete this.fragments[fragment.messageid];
        this.statsdclient.increment("errbit.proxy.incomplete.completed");
        return complete;
    } else {
      return false;
    }

  },
  cleanmemory: function () {
   for (var fragment in this.fragments) {
     if ((Date.now() - this.fragments[fragment].createdat) / 1000 > 60) {
         delete this.fragments[fragment];
         this.statsdclient.increment("errbit.proxy.incomplete.deleted");
     }
    }
  }
}

exports.Reassembler = Reassembler;
