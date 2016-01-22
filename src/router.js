(function() {
    var CZStream = require('./czStream');
    var _Promise = require('bluebird');

    var _routes = {};

    var Router = (function() {
        function Router() {}

        Router.prototype.createRoute = function(id) {
            _routes[id] = {stream: new CZStream()};
            return _routes[id].stream;
        };

        Router.prototype.send = function(sender, receiver, message) {
            return new _Promise(function(resolve, reject) {
                var route = _routes[receiver];
                var payload = {
                    sender: sender,
                    receiver: receiver,
                    message: message,
                    promise: {
                        reject: reject,
                        resolve: resolve
                    }
                };
                return route.stream.push(payload);
            });
        };

        return Router;
    })();

    module.exports = new Router();
}).call(this);
