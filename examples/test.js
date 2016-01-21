var Bond = require('../src/Bond');

var actorOne = Bond.Actor({
    id: 'actorOne',
    process: function(sender, message) {
        console.log("actorOne get a message from ", sender, message);
    }
});

var actorTwo = Bond.Actor({
    id: 'actorTwo',
    process: function(sender, message) {
        console.log("actorTwo get a message from ", sender, message);
    }
});


actorTwo.send('actorOne', {msg: 'Message from actorTwo'});
