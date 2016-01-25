(function() {
    var CZ = require('cz-actor');
    var express = require('express');
    var bodyParser = require('body-parser');
    var session = require('express-session');
    var path = require('path');
    var ejs = require('ejs');

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
            //Server configuration

            // view engine setup
            app.set('views', path.join(process.cwd(), 'mod', 'view'));
            app.set('view engine', 'ejs');

            app.use(bodyParser.urlencoded({
                limit: '5mb',
                extended: true
            }));
            app.use(bodyParser.json({limit: '5mb'}));

            // Use express session support since OAuth2orize requires it
            app.use(session({
              secret: 'Super Secret Session Key',
              saveUninitialized: true,
              resave: true
            }));

            app.use('/', router);

            //Test endpoint
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

