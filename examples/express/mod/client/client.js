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
                    if (message.type === 'queryOne') {
                        this.actor.send('dbActor', {type: 'queryOne', name: 'Client', query: message.query}).then(function(data) {
                            promise.resolve(data);
                        }, function(err) {
                            promise.reject(err);
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
                code: {type: String, required: false},
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
                            var newClient = {
                                cid: uid(10),
                                type: req.body.type,
                                name: req.body.name,
                                created_at: new Date()
                            };

                            var type = req.body.type;
                            if (type === 'internal') {
                                newClient.public_key = uid(32);
                                newClient.secret_key = uid(32);
                            } else {
                                newClient.public_key = req.body.username;
                                newClient.secret_key = req.body.password;
                            }

                            if (type === 'internal') {
                                this.actor.send('oauthActor', {
                                    type: 'codeCreate',
                                    data: {
                                        client: newClient.cid,
                                        type: 'internal'
                                    }
                                }).then(function(codeCreated) {
                                    newClient.code = codeCreated.value;
                                    this.actor.send('dbActor', {type: 'create', name: 'Client', data: newClient}).then(function(clientCreated) {
                                        res.json({success: true, client: clientCreated});
                                    }, function(err) {
                                        console.log(err);
                                        res.status(500);
                                        res.json({success: false, msg: 'Internal error!'});
                                    });
                                }.bind(this), function(err) {
                                    console.log(err);
                                    res.status(500);
                                    res.json({success: false, msg: 'Internal error!'});
                                })
                            } else {
                                this.actor.send('dbActor', {type: 'create', name: 'Client', data: newClient}).then(function(clientCreated) {
                                    res.json({success: true, client: clientCreated});
                                }, function(err) {
                                    console.log(err);
                                    res.status(500);
                                    res.json({success: false, msg: 'Internal error!'});
                                });
                            }
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
