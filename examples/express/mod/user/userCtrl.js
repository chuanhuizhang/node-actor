(function() {

    var bcrypt = require('bcryptjs');
    var userActor = null;

    var UserCtrl = (function() {

        function UserCtrl(actor) {
            userActor = actor;
        }

        var abort = function(res, code, msg) {
            var response = {
                success: false,
                code: 500,
                msg: 'Internal error'
            };
            if (code) response.code = code;
            if (msg) response.msg = msg;
            res.status(code);
            res.json(response);
        };

        UserCtrl.prototype.create = function(req, res, next) {
            var data = req.body;
            data.created_at = new Date();

            data.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10));

            userActor.send('dbActor', {type: 'create', name: 'User', data: data}).then(function(userCreated) {
                userCreated.password = undefined;
                res.json({success: true, user: userCreated});
            }, function(err) {
                abort(res, 500, err.errmsg);
            });
        }

        return UserCtrl;

    })();

    module.exports = UserCtrl;
}).call(this);
