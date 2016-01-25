(function() {
    var CZ = require('cz-actor');
    // var passport = require('passport');
    // var BearerStrategy = require('passport-http-bearer').Strategy;
    var oauth2orize = require('oauth2orize');

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

    var Oauth = (function() {
        function Oauth() {
            this.actor = CZ.Actor({
                id: 'oauthActor',
                process: function(sender, message, promise) {
                    if (message.type === 'codeCreate') {
                        message.data.value = uid(16);
                        message.data.created_at = new Date();
                        this.actor.send('dbActor', {type: 'create', name: 'Code', data: message.data}).then(function(result) {
                            promise.resolve(result);
                        }, function(err) {
                            promise.reject(err);
                        });
                    }
                }.bind(this)
            });
            this.initialize();
        }

        Oauth.prototype.initialize = function() {


            /****************************************************
             ***************  OAuth Datebase  *******************
             ****************************************************/
            this.tokenSchema = {
                value: { type: String, unique: true, required: true },
                type: {type: String, required: true},
                client: {type: String, required: true },
                user: {type: require('mongoose').Schema.Types.ObjectId, ref: 'User', required: false },
                scope: [String],
                created_at: { type: Date, required: true }
            };

            this.actor.send('dbActor', {
                type: 'schema',
                name: 'Token',
                schema: this.tokenSchema
            }).then(function(result) {
                this.tokenModel = result;
            }, function(err) {
                console.log(err);
            });

            this.codeSchema = {
                value: { type: String, unique: true, required: true },
                type: {type: String, required: true},
                client: {type: String, required: true },
                user: {type: require('mongoose').Schema.Types.ObjectId, ref: 'User', required: false },
                redirect_uri: { type: String, required: false },
                created_at: { type: Date, required: true }
            };

            this.actor.send('dbActor', {
                type: 'schema',
                name: 'Code',
                schema: this.codeSchema
            }).then(function(result) {
                this.codeModel = result;
            }, function(err) {
                console.log(err);
            });
            /****************  OAuth Database  ******************/

            /****************************************************
             ****************  OAuth Server  ********************
             ****************************************************/
            var server = oauth2orize.createServer();

            server.serializeClient(function(client, callback) {
              return callback(null, client.cid);
            });

            server.deserializeClient(function(cid, callback) {
                this.actor.send('clientActor', {type: 'queryOne', query: {cid: cid} }).then(function(data) {
                    console.log(data);
                    return callback(null, data);
                }, function(err) {
                    return callback(err);
                });
            }.bind(this));

            server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, callback) {
console.log(user);
                var codeNew = {
                    value: uid(16),
                    clientId: client.cid,
                    redirectUri: redirectUri,
                    userId: user._id
                }

                this.actor.send('dbActor', {type: 'create', name: 'Code', data: codeNew}).then(function(codeCreated) {
                    callback(null, codeCreated.value);
                }, function(err) {
                    return callback(err);
                });
            }));

            server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, callback) {

                this.actor.send('dbActor', {
                    type: 'queryOne',
                    name: 'Code',
                    query: {
                        value: code
                    }
                }).then(function(authCode) {
                    if (!authCode) return callback(null, false);

                    if (!client && authCode.type === 'internal') {
                        this.actor.send('dbActor', {
                            type: 'queryOne',
                            name: 'Token',
                            query: {
                                client: authCode.client
                            }
                        }).then(function(result) {
                            if (!result) {
                                //Create Token
                                var data = {
                                    value: uid(256),
                                    type: 'Access Token',
                                    client: authCode.client,
                                    created_at: new Date(),
                                    scope: '*'
                                };

                                this.actor.send('dbActor', {
                                    type: 'create',
                                    name: 'Token',
                                    data: data
                                }).then(function(result) {
                                    callback(null, result);
                                }, function(err) {
                                    console.log(err);
                                    callback(err);
                                });
                            } else {
                                callback(null, result);
                            }
                        }.bind(this), function(err) {
                            console.log(err);
                            callback(err);
                        });
                    } else {
                        if (client.cid !== authCode.clientId) { return callback(null, false); }
                        if (redirectUri !== authCode.redirectUri) { return callback(null, false); }

                        // Delete auth code now that it has been used
                        this.actor.send('dbActor', {
                            type: 'remove',
                            name: 'Code',
                            query: {
                                _id: authCode._id
                            }
                        }).then(function(result) {
                            //Create Token
                            var data = {
                                value: uid(256),
                                type: 'Access Token',
                                client: client.cid,
                                user: authCode.user,
                                created_at: new Date(),
                                scope: '*'
                            };

                            this.actor.send('dbActor', {
                                type: 'create',
                                name: 'Token',
                                data: data
                            }).then(function(result) {
                                callback(null, result);
                            }, function(err) {
                                console.log(err);
                                callback(err);
                            });
                        }.bind(this), function(err) {
                            console.log(err);
                            return callback(err);
                        });
                    }
                }.bind(this), function(err) {
                    console.log(err);
                    return callback(err);
                });
            }.bind(this)));

            var authorize = [
                server.authorization(function(clientId, redirectUri, callback) {
                    this.actor.send('clientActor', {
                        type: 'queryOne',
                        query: {cid: clientId}
                    }).then(function(clientFound) {
                        return callback(null, clientFound, redirectUri);
                    }, function(err) {
                        console.log(err);
                        callback(err);
                    });
                }.bind(this)),
                function(req, res, next) {
//TODO: Fail to get the user object by customized way to do authentication.
                    if (req.oauth2.client.type === 'internal') {
                        res.status(400);
                        res.json({success: false, msg: 'Internal client do not have to do this!'});
                    } else {
                        res.render('authorize', { transactionID: req.oauth2.transactionID, user: req.body.user, client: req.oauth2.client });
                    }
                }
            ];

            var internalClientAuthorize = function(req, res, next) {
                if (req.body.code == 0) {
                    this.actor.send('clientActor', {
                        type: 'query',
                        query: {
                            type: 'internal',
                            public_key: req.body.public_key
                        }
                    }).then(function(data) {
                        if (data.length > 0 && data[0].secret_key === req.body.secret_key) {
                            next(data);
                        } else {
                            res.json({success: false, msg: 'The keys you provide are invalid!'});
                        }
                    }, function(err) {
                        console.log(err);
                        res.status(500);
                        res.json({success: false, msg: 'Internal error!'});
                    });
                } else {
                    next();
                }
            }.bind(this);

            var signInHandler = function(req, res, next) {
                if (req.body.email && req.body.password) {
                    this.actor.send('userActor', {type: 'queryOne', query: {email: req.body.email}}).then(function(userFound) {
                        if (!userFound) {
                            res.status(404);
                            res.json({success: false, msg: 'The account is not valid!'});
                            return;
                        }
                        if (userFound.password == req.body.password) {
                            res.json({success: true, user: {firstname: userFound.firstname}});
                        } else {
                            console.log(userFound.password, req.body.password);
                            res.status(401);
                            res.json({success: false, msg: 'The password is not correct!'});
                        }
                    }, function(err) {
                        console.log(err);
                        res.status(500);
                        res.json({success: false, msg: 'Interval error!'});
                    });
                } else {
                    res.status(400);
                    res.json({success: false, msg: 'Email and password are required!'});
                }
            }.bind(this);
            /****************  OAuth Server  ********************/

            /****************************************************
             ***************  OAuth Endpoint  *******************
             ****************************************************/
            // /authorize get
            this.actor.send('apiActor', {
                type: 'route',
                request: {
                    method: 'GET',
                    url: '/oauth/authorize',
                    handlers: authorize
                }
            });

            // /authorize post
            this.actor.send('apiActor', {
                type: 'route',
                request: {
                    method: 'POST',
                    url: '/oauth/authorize',
                    handlers: [server.decision()]
                }
            });

            // /signin post
            this.actor.send('apiActor', {
                type: 'route',
                request: {
                    method: 'POST',
                    url: '/oauth/signin',
                    handlers: [signInHandler]
                }
            });

            // /token post
            this.actor.send('apiActor', {
                type: 'route',
                request: {
                    method: 'POST',
                    url: '/oauth/token',
                    handlers: [internalClientAuthorize, server.token(), server.errorHandler()]
                }
            });
            /****************  OAuth Endpoint  ******************/
        };

        Oauth.prototype.start = function() {
            // // Test: talk with other actor to get data from database
            // this.actor.send('clientActor', {type: 'query', query: {} }).then(function(data) {
            //     console.log(data);
            // }, function(err) {
            //     console.log(err);
            // });
        };
        return Oauth;
    })();

    module.exports = new Oauth();

}).call(this);
