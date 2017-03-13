module.exports = {
  relay: relay
}
var database = require('./database');

//relay_server = "98.168.142.41:5000";
var relay = require('socket.io-client')("http://"+database.relay_server);
module.exports.relay = relay;
console.log('socket io:',database.relay_server);
/*function start_relay() {
  relay_connected = true;
}*/

relay.on('disconnect', function() {
  console.log("disconnected, setting got_token false");
  got_token = false;
});

