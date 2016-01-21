(function() {
    var CZ = require('cz-actor');

    var User = (function() {
        function User() {
            this.actor = CZ.Actor({
                id: 'userActor',
                process: function(sender, message) {
                    console.log("userActor get a message from ", sender, message);
                }
            });
            this.initialize();
        }


        User.prototype.initialize = function() {
            this.schema = {
                email: { type: String, unique: true, required: true },
                password: { type: String, required: true },
                firstname: {'type': String, required: true },
                lastname: {'type': String, required: true },
                created_at: { type: Date, required: true }
            }
        }

        User.prototype.start = function() {
            this.actor.send('apiActor', {
                type: 'route',
                request: {
                    method: 'GET',
                    url: '/users',
                    handlers: [
                        function(req, res, next) {
                            res.json({success: true, result: 'All Users'});
                        }
                    ]
                }
            });

            this.actor.send('dbActor', {
                type: 'schema',
                name: 'User',
                schema: this.schema
            }).then(function(result) {
                this.model = result;
                this.model.find({}, function(err, users) {
                    console.log("Find all reuslt: ", users);
                });

            }, function(err) {
                console.log(err);
            });

        };

        return User;
    })();

    module.exports = new User();

}).call(this);



