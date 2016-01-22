(function() {
    var CZ = require('cz-actor');

    // TODO: Should we create a utility actor to do these
    /****************************************************
     **************  Utility Functions  *****************
     ****************************************************/
    var uid = function(len) {
        var buf = [];
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charlen = chars.length;

        for (var i = 0; i < len; ++i) {
            buf.push(chars[(function(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            })(0, charlen - 1)]);
        }

        return buf.join('');
    };

    /**************  Utility Functions  *****************/

    var Client = (function() {
        function Client() {
            this.actor = CZ.Actor({
                id: 'clientActor',
                process: function(sender, message, promise) {
                    if (message.type === 'query') {
                        this.actor.send('dbActor', {type: 'query', name: 'Client', query: {}}).then(function(data) {
                            console.log(data);
                        }, function(err) {
                            console.log(err);
                        });
                    } else if (message.type === 'create') {

                    }
                }.bind(this)
            });
            this.initialize();
        }

        Client.prototype.initialize = function() {
            this.schema = {
                cid: { type: String, unique: true, required: true },
                type: {type: String, required: true},
                name: {type: String, required: true},
                public_key: {type: String, unique: true, required: false},
                secret_key: {type: String, required: false},
                created_at: { type: Date, required: true }
            };

            // /clients post
            this.actor.send('apiActor', {
                type: 'route',
                request: {
                    method: 'POST',
                    url: '/clients',
                    handlers: [
                        function(req, res, next) {
                            var data = {
                                cid: uid(10),
                                type: req.body.type,
                                name: req.body.name,
                                created_at: new Date()
                            };

                            var type = req.body.type;
                            if (type === 'internal') {
                                data.public_key = uid(32),
                                data.secret_key = uid(32)
                            } else {
                                data.public_key = req.body.username,
                                data.secret_key = req.body.password
                            }

                            this.actor.send('dbActor', {type: 'create', name: 'Client', data: data}).then(function(data) {
                                res.json({success: true, client: data});
                            }, function(err) {
                                res.status(500);
                            });
                        }.bind(this)
                    ]
                }
            });
        };

        Client.prototype.start = function() {
            this.actor.send('dbActor', {
                type: 'schema',
                name: 'Client',
                schema: this.schema
            }).then(function(result) {
                this.model = result;
            }, function(err) {
                console.log(err);
            });
        };
        return Client;

    })();

    module.exports = new Client();

}).call(this);
