(function() {
    var CZ = require('cz-actor');
    var express = require('express');
    var bodyParser = require('body-parser');
    var app = express();

    var router = express.Router();

    var Api = (function() {
        function Api() {
            this.actor = CZ.Actor({
                id: 'apiActor',
                process: function(sender, message, promise) {
                    if (message.type === 'route') {
                        var request = message.request;
                        switch(request.method) {
                            case 'GET':
                                router.get(request.url, request.handlers);
                                break;
                            case 'POST':
                            default:
                                router.post(request.url, request.handlers);
                                break;
                        }
                        promise.resolve({success: true});
                    }
                }
            });
            this.initialize();
        }

        Api.prototype.initialize = function() {
            //TODO: Server configuration
            app.use(bodyParser.urlencoded({
                limit: '5mb',
                extended: true
            }));
            app.use(bodyParser.json({limit: '5mb'}));

            app.use('/', router);

            //TODO: Test endpoint
            router.get('/', function(req, res, next) {
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

