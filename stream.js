// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- stream.js -------------------------------------- //

var TAG = "[stream.js]";
var http = require('http');
var https= require('https');
var fs = require('fs');
var use_ssl = config.use_ssl || false;
var use_domain_ssl = config.use_domain_ssl || false;
var use_dev = config.use_dev || false;
var WebSocket = require('ws');


//ssl_certificate /etc/letsencrypt/live/pyfi.org/fullchain.pem;
//ssl_certificate_key /etc/letsencrypt/live/pyfi.org/privkey.pem;

if(use_dev){
var privateKey = fs.readFileSync('./key.pem');
var certificate = fs.readFileSync('./cert.pem');
var credentials = { key: privateKey, cert: certificate };
} else {
var privateKey = fs.readFileSync('/etc/letsencrypt/live/pyfi.org/privkey.pem');
var certificate = fs.readFileSync('/etc/letsencrypt/live/pyfi.org/fullchain.pem');
var credentials = { key: privateKey, cert: certificate };
};


var STREAM_PORT = config.video_stream_port || 5054;
var WEBSOCKET_PORT = config.video_websocket_port || 8085;

// Websocket Server
if (use_ssl || use_domain_ssl || use_dev === false){
  var httpsServer = https.createServer(credentials).listen(WEBSOCKET_PORT);
  var socketServer = new WebSocket.Server({server: httpsServer});
  socketServer.connectionCount = 0;
} else {
  var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
  socketServer.connectionCount = 0;
};

socketServer.on('connection', function(socket) {
  socketServer.connectionCount++;
  console.log( TAG,'video socket opened ('+socketServer.connectionCount+' total)' );

  socket.onmessage = function (event) {
    var data = JSON.parse(event.data);
    socket.token = data.token;
    socket.camera = data.camera;
    //console.log("stored video token",socket.token);
    console.log(TAG,"stored token for camera",socket.camera);
    console.log(TAG,"clients",this.clients);
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
  var camera = settings.camera;
  //console.log("<< !!! BROADCAST TO CLIENTS !!! >>>",socketServer.clients);

  socketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      if (client.token == token && client.camera == camera) {
        client.send(data);
        //console.log("<< !!! SENDING BROADCAST ("+client.token+") !!! >>>");
      }

      if (client.readyState !== WebSocket.OPEN) {
        console.log("Client not connected ("+i+")");
        //continue;
      } 
    }
  });

  /*for( var i in this.clients ) {
    console.log("<< !!! SENDING BROADCAST DATA !!! >>>");
    var client = this.clients[i];
    if (client.token != token) {
      console.log("wrong token");
      continue;
    }
    if (client.camera != camera) {
      console.log("wrong camera");
      continue;
    }
    if (client.readyState !== WebSocket.OPEN) {
      console.log("Client not connected ("+i+")");
      continue;
    }
 
    this.clients[i].send(data);
    console.log("<< !!! SENDING BROADCAST ("+i+") !!! >>>");
  }*/
};

// HTTP Server to accept incomming MPEG Stream
if (use_ssl || use_domain_ssl || use_dev === false){
var streamServer = require('https').createServer(credentials, function(request, response) {
  response.connection.setTimeout(0);

  var params = request.url.substr(1).split('/');
  var token = params[0];
  var camera = params[1];
  var settings = {token:token, camera:camera};
  var index = find_index(device_objects,'token',token);
  if (index < 0) return console.log('streamServer | device not found');
  
  request.on('data', function(data){
    socketServer.broadcast(data, settings);
  });
  console.log(TAG,"incoming stream: ",params);
}).listen(STREAM_PORT);
} else {
var streamServer = require('http').createServer(function(request, response) {
  response.connection.setTimeout(0);

  var params = request.url.substr(1).split('/');
  var token = params[0];
  var camera = params[1];
  var settings = {token:token, camera:camera};
  var index = find_index(device_objects,'token',token);
  if (index < 0) return console.log('streamServer | device not found');
  
  request.on('data', function(data){
    socketServer.broadcast(data, settings);
  });
  console.log(TAG,"incoming stream: ",params);
}).listen(STREAM_PORT);
};

if (use_ssl || use_domain_ssl || use_dev === false){
console.log('Listening for MPEG Stream on https://127.0.0.1:'+STREAM_PORT+'/<token>/<camera>/');
console.log('Awaiting WebSocket connections on wss://127.0.0.1:'+WEBSOCKET_PORT+'/');
} else {
console.log('Listening for MPEG Stream on http://127.0.0.1:'+STREAM_PORT+'/<token>/<camera>/');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
};
//------------------------------//

function find_index(array, key, value) {
  for (var i=0; i < array.length; i++) {
    if (array[i][key] == value) {
      return i;
    }
  }
  return -1;
}
