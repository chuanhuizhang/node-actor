var router = require('./router');

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var Actor = (function() {

    function Actor(options) {
        this._doProcess = bind(this._doProcess, this);
        if (!(this instanceof Actor)) {
          return new Actor(options);
        }
        for (var property in options) {
            this[property] = options[property];
        }
        this.stream = router.createRoute(this.id);
        this.stream.onLoad(this._doProcess);
    }

    Actor.prototype.send = function(receiver, message) {
        return router.send(this.id, receiver, message).bind(this);
    };

    Actor.prototype._doProcess = function(payload) {
        return payload.callback(null, this.process(payload.sender, payload.message));
    };

    return Actor;
})();

module.exports = Actor;
