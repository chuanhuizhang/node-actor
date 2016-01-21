(function() {

    var CZ = require('cz-actor');
    var mongoose = require('mongoose');
    var db = mongoose.connection;

    var Db = (function(){
        function Db() {
            this.actor = CZ.Actor({
                id: 'dbActor',
                process: function(sender, message) {
                    if (message.type === 'schema') {
                        var Schema = new mongoose.Schema(message.schema);
                        return db.model(message.name, Schema);
                    }
                }
            });
        }

        Db.prototype.initialize = function() {
            //TODO: get config settings
            db.on('error', function (err) {
                console.error('MongoDB connection error:', err);
            });
            db.once('open', function callback() {
                console.info('MongoDB connection is established');
            });
            db.on('disconnected', function() {
                console.error('MongoDB disconnected!');
                mongoose.connect(process.env.MONGO_URL, {server:{auto_reconnect:true}});
            });
            db.on('reconnected', function () {
                console.info('MongoDB reconnected!');
            });
        };

        Db.prototype.start = function() {
            //TODO: use configure settings
            mongoose.connect('mongodb://localhost:27017/express-actor', {server:{auto_reconnect:true}});
        };

        return Db;
    })();

    module.exports = new Db();

}).call(this);
