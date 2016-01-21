var BondStream = (function() {
    function BondStream() {}

    BondStream.prototype.push = function(payload) {
        return this._onLoad(payload);
    };

    BondStream.prototype.onLoad = function(fn) {
        this._onLoad = fn;
        return function() {};
    }

    return BondStream;

})();

module.exports = BondStream;
