var CZ = require('../src/cz');

var actorOne = CZ.Actor({
    id: 'actorOne',
    process: function(sender, message) {
        console.log("actorOne get a message from ", sender, message);
    }
});

var actorTwo = CZ.Actor({
    id: 'actorTwo',
    process: function(sender, message) {
        console.log("actorTwo get a message from ", sender, message);
    }
});


actorTwo.send('actorOne', {msg: 'Message from actorTwo'});
