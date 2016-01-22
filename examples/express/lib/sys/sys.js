(function() {
    var CZ = require('cz-actor');

    var api = require('../api/api');
    var db = require('../db/db');
    var client = require('../../mod/client/client');
    var oauth = require('../../mod/oauth/oauth');
    var user = require('../../mod/user/user');

    var Sys = (function(){
        function Sys() {
            this.actor = CZ.Actor({
                id: 'sysActor',
                process: function(sender, message, promise) {
                    console.log("sysActor get a message from ", sender, message);
                }
            });
        }

        Sys.prototype.start = function() {
            api.start();
            db.start();
            client.start();
            oauth.start();
            user.start();
        };

        return Sys;
    })();

    module.exports = new Sys();
}).call(this);
