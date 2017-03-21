// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //

var 	http = require('http'),
	WebSocket = require('ws');

var STREAM_SECRET = "init",
    STREAM_PORT = 8082,
    WEBSOCKET_PORT = 8084,
    STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

// Websocket Server
var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
socketServer.connectionCount = 0;

socketServer.on('connection', function(socket) {
  socketServer.connectionCount++;
  console.log( 'video socket opened ('+socketServer.connectionCount+' total)' );

  socket.onmessage = function (event) {
    var token = event.data;
    socket.token = token;
    console.log("stored video token",socket.token);
  }

  socket.on('close', function(code, message){
    var index = find_index(user_objects,'socket',socket);
    if (index > -1) user_objects.splice(index,1);
    socketServer.connectionCount--;
    console.log( 'video socket closed ('+socketServer.connectionCount+' total)' );
  });

});

socketServer.on('disconnect', function(socket) {
    var index = find_index(user_objects,'socket',socket);
    if (index > -1) user_objects.splice(index,1);
    console.log( 'disconnect video socket ('+socketServer.clients.length+' total)' );
});


socketServer.broadcast = function(data, settings) {
  var token = settings.token;
  var stream_width = settings.stream_width;
  var stream_height = settings.stream_height;
  
  for( var i in this.clients ) {
    var client = this.clients[i];
    if (client.token != token) continue;
    if (client.readyState !== WebSocket.OPEN) {
      console.log("Client not connected ("+i+")");
      continue;
    }
 
    this.clients[i].send(data);
    //console.log("<< !!! SENDING BROADCAST ("+i+") !!! >>>");
  }
};

// HTTP Server to accept incomming MPEG Stream
var streamServer = require('http').createServer( function(request, response) {
  response.connection.setTimeout(0);
  var params = request.url.substr(1).split('/');
  var token = params[0];
  var settings = {token:token};

  var index = find_index(device_objects,'token',token);
  if (index < 0) return console.log('device not found');
  
  request.on('data', function(data){
    socketServer.broadcast(data, settings);
  });
}).listen(STREAM_PORT);

console.log('Listening for MPEG Stream on http://127.0.0.1:'+STREAM_PORT+'/<token>/<width>/<height>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
//------------------------------//

function find_index(array, key, value) {
  for (var i=0; i < array.length; i++) {
    if (array[i][key] == value) {
      return i;
    }
  }
  return -1;
}
