var CZ = require('cz-actor');


var User = (function() {
    function User() {
        this.actor = CZ.Actor({
            id: 'userActor',
            process: function(sender, message) {
                console.log("userActor get a message from ", sender, message);
            }
        });
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
    };

    return User;
})();

module.exports = new User();

