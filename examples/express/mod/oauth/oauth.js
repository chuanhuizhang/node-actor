(function() {
    var CZ = require('cz-actor');

     var Oauth = (function() {
        function Oauth() {
            this.actor = CZ.Actor({
                id: 'oauthActor',
                process: function(sender, message, promise) {
                    console.log("oauthActor get a message from ", sender, message);
                }
            });
            this.initialize();
        }

        Oauth.prototype.initialize = function() {
            this.schema = {
                value: { type: String, unique: true, required: true },
                type: {type: String, required: true},
                scope: [String],
                created_at: { type: Date, required: true }
            };
        };

        Oauth.prototype.start = function() {
            // Test: talk with other actor to get data from database
            this.actor.send('clientActor', {type: 'query', query: {} }).then(function(data) {
                console.log(data);
            }, function(err) {
                console.log(err);
            });
        };
        return Oauth;
    })();

    module.exports = new Oauth();

}).call(this);
