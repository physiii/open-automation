// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var io_upstairs = require('socket.io-client')('http://192.168.0.9:3000');
var io_downstairs = require('socket.io-client')('http://192.168.0.3:3000');
var port = process.env.PORT || 3000;
var php = require("node-php"); 

var exec = require('child_process').exec;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'), php.cgi("/"));


var d = new Date();
var light_delay = 0; //command delay in ms
var previous_data = 0;

function send_command(command){
      console.log(command);
      var child = exec(command,
        function (error, stdout, stderr) {
        if (error !== null) {
          console.log('' + error);
        }
      });
}

io.on('connection', function (socket) {

  var addedUser = false;
  socket.on('vlc_upstairs', function (data) {
    io2.emit('vlc', data);
console.log( Date.now() + " playing vlc_upstairs...");
  });
  socket.on('vlc_downstairs', function (data) {
    io3.emit('vlc', data);
console.log( Date.now() + " playing vlc_dowstairs...");
  });


  socket.on('media_upstairs', function (data) {
    io_upstairs.emit('media', data);
    console.log( Date.now() + " upstairs " + data);
    
  });

  socket.on('media_downstairs', function (data) {
    io_downstairs.emit('media', data);
    console.log( Date.now() + " downstairs " + data);
  });
  
  socket.on('peerflix_downstairs', function (data) {
    io_downstairs.emit('peerflix', data);
    console.log( Date.now() + " downstairs peerflix " + data);
  });  
  
  socket.on('peerflix_upstairs', function (data) {
    io_upstairs.emit('peerflix', data);
    console.log( Date.now() + " upstairs peerflix " + data);
  });  

  socket.on('lights', function (data) {
      //Date.now = function() { return new Date().getTime(); }
      console.log("<<-------- " + Date.now() + " -------->>");
      if (data <= 254 && data >= 0){
         if (data > 200) data = 254;
         diff = Math.abs(data - previous_data);
         if (diff > 20){
           send_command("perl huepl bri 1 " + data);
           send_command("perl huepl bri 2 " + data);
           send_command("perl huepl bri 3 " + data);
           send_command("perl huepl bri 4 " + data);
           send_command("perl huepl bri 5 " + data); 
           send_command("perl huepl bri 6 " + data); 
           send_command("perl huepl bri 7 " + data); 
           send_command("perl huepl bri 8 " + data);
           send_command("perl huepl bri 9 " + data); 
           previous_data = data;
         }
      } else {
      if (data != "off") {
        send_command("perl huepl on 1");
        send_command("perl huepl on 2");
        send_command("perl huepl on 3");
        send_command("perl huepl on 4");
        send_command("perl huepl on 5");         
        send_command("perl huepl on 6");
        send_command("perl huepl on 7");         
        send_command("perl huepl on 8");
        send_command("perl huepl on 9");         
        send_command("perl huepl on 10");
       }
       send_command("perl huepl "+data+" 1");
       send_command("perl huepl "+data+" 2");
       send_command("perl huepl "+data+" 3");
       send_command("perl huepl "+data+" 4");
       send_command("perl huepl "+data+" 5");
       send_command("perl huepl "+data+" 6");
       send_command("perl huepl "+data+" 7");
       send_command("perl huepl "+data+" 8");
       send_command("perl huepl "+data+" 9");
       send_command("perl huepl "+data+" 10");
       }
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});


