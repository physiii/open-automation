module.exports = {
  relay: relay
}

var relay_server = "127.0.0.1";
//relay_server = "24.253.223.242";
relay_server = "98.168.142.41:5000";
var relay = require('socket.io-client')("http://"+relay_server);
module.exports.relay = relay;
console.log('socket io:',relay_server);
/*function start_relay() {
  relay_connected = true;
}*/

relay.on('disconnect', function() {
  console.log("disconnected, setting got_token false");
  got_token = false;
});

