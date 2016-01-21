(function() {
    var CZStream = (function() {
        function CZStream() {}

        CZStream.prototype.push = function(payload) {
            return this._onLoad(payload);
        };

        CZStream.prototype.onLoad = function(fn) {
            this._onLoad = fn;
            return function() {};
        };

        return CZStream;

    })();

    module.exports = CZStream;
}).call(this);
