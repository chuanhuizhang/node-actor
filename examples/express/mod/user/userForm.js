(function() {

    var validator = require('validator');
    var userActor = null;

    var UserForm = (function() {
        function UserForm(actor) {
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

        UserForm.prototype.create = function(req, res, next) {
            var email = req.body.email;
            var password = req.body.password;
            var confirm_password = req.body.confirm_password;
            var firstname = req.body.firstname;
            var lastname = req.body.lastname;

            if (!email) {
                abort(res, 400, 'Email is reqired.');
                return;
            } else if (!validator.isEmail(email)) {
                abort(res, 400, 'Email is invalid.');
                return;
            }

            if (!password) {
                abort(res, 400, 'Password is required.');
                return;
            } else if (!validator.isLength(password, 6, 20)) {
                abort(res, 400, 'Password should be 6~20 characters.');
                return;
            }

            if (!confirm_password) {
                abort(res, 400, 'Confirm password is required.');
                return;
            } else if (!validator.equals(confirm_password, password)) {
                abort(res, 400, 'Password does not match the confirm password.');
                return;
            }

            if (!firstname) {
                abort(res, 400, 'First name is required.');
                return;
            } else if (!validator.isLength(firstname, 1, 20)) {
                abort(res, 400, 'First name is invalid');
                return;
            }

            if (!lastname) {
                this.abort(res, 400, 'Last name is required.');
                return;
            } else if (!validator.isLength(lastname, 1, 20)) {
                abort(res, 400, 'Last name is invalid');
                return;
            }

            userActor.send('dbActor', {type: 'queryOne', name: 'User', query: {email: email}}).then(function(userFound) {
                if (userFound) {
                    abort(res, 409, email + ' already exists.');
                } else {
                    next();
                }
            }, function(err) {
                abort(res, 500, err.errmsg);
            });

        };

        return UserForm;
    })();

    module.exports = UserForm;
}).call(this);
