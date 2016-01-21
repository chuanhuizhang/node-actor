(function() {
    var CZ = require('cz-actor');
    var express = require('express');
    var app = express();

    var Api = (function() {
        function Api() {
            this.actor = CZ.Actor({
                id: 'apiActor',
                process: function(sender, message) {
                    if (message.type === 'route') {
                        var request = message.request;
                        switch(request.method) {
                            case 'GET':
                                app.get(request.url, request.handlers);
                                break;
                            case 'POST':
                            default:
                                app.post(request.url, request.handlers);
                                break;
                        }
                        return {success: true};
                    }
                }
            });
            this.initialize();
        }

        Api.prototype.initialize = function() {
            //TODO: Server configuration

            //TODO: Test endpoint
            app.get('/', function(req, res, next) {
                res.json({api: '2.0'});
            });
        }

        Api.prototype.start = function() {
            app.listen(3000);
            console.log("The server is running on port 3000!");
        };

        return Api;
    })();

    module.exports = new Api();

}).call(this);

