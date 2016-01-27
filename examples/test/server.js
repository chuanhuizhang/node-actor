var express = require('express');
var ejs = require('ejs');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var router = express.Router();

var request = require('request');

// view engine setup
app.set('views', path.join(process.cwd(), 'view'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    limit: '5mb',
    extended: true
}));
app.use(bodyParser.json({limit: '5mb'}));

app.use('/', router);


router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/callback', function(req, res, next) {
    request.post(
        'http://localhost:3000/oauth/token',
        { form: {
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: 'http://localhost:8090/callback',
                public_key: 'ldDW0ada4mMTNyv4iQ7rcudzjyqvpK3z',
                secret_key: 'KBYqJXdt6CUh4HN2RYj7dh9C54kPYWls'
            }
        },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                res.json({success: true, result: body});
            }
        }
    );

});

app.listen(8090);
