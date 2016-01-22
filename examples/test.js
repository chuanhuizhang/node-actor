var CZ = require('../src/cz');

var actorOne = CZ.Actor({
    id: 'actorOne',
    process: function(sender, message, promise) {
        console.log("actorOne get a message from ", sender, message);
        setTimeout(function() {
            promise.resolve('From 1');
        }, 3000);
    }
});

var actorTwo = CZ.Actor({
    id: 'actorTwo',
    process: function(sender, message, promise) {
        console.log("actorTwo get a message from ", sender, message);
        promise.resolve('From 2');
    }
});


actorTwo.send('actorOne', {msg: 'Message from actorTwo'}).then(function(result){
    console.log(result);
}, function(err) {
    console.log(err);
});
