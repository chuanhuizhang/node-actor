(function() {

    var CZ = require('cz-actor');
    var mongoose = require('mongoose');
    var db = mongoose.connection;

    var _models = {}

    var Db = (function(){
        function Db() {
            // TODO: errrrrrrrrr, return is not working in asynchronous call, need to add asyn send method in actor lib
            this.actor = CZ.Actor({
                id: 'dbActor',
                process: function(sender, message) {
                    if (message.type === 'schema') {
                        var Schema = new mongoose.Schema(message.schema);
                        var model = db.model(message.name, Schema);
                        _models[message.name] = model;
                        return model;
                    } else if (message.type === 'query') {
                        _models[message.name].find(message.query, function(err, result) {
                            if (err) throw err;
                            return result;
                        });
                    } else if (message.type === 'create') {
                        var item = new _models[message.name](message.data);
                        item.save(function(err, result) {
                            if (err) throw err;
                            return item;
                        });
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
