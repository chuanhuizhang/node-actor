(function() {
    var CZ = require('cz-actor');

    var api = require('../api/api');
    var user = require('../../mod/user/user');

    var Sys = (function(){
        function Sys() {
            this.actor = CZ.Actor({
                id: 'sysActor',
                process: function(sender, message) {
                    console.log("sysActor get a message from ", sender, message);
                }
            });
        }

        Sys.prototype.start = function() {
            api.start();
            user.start();
        };

        return Sys;
    })();

    module.exports = new Sys();
}).call(this);
