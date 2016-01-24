// Setup basic express server
var fs = require('fs');
var os = require('os');
var express = require('express');
var app = express();
var program_app = express();
var querystring = require('querystring');
var http = require('http');
var server = require('http').createServer(app);
var program_server = require('http').createServer(program_app);
var program_io = require('socket.io')(program_server);
var io = require('socket.io')(server);
var io_upstairs = require('socket.io-client')('http://192.168.0.9:3000');
var io_downstairs = require('socket.io-client')('http://192.168.0.3:3000');
var port = process.env.PORT || 3030;
//var program_port = process.env.PORT || 3000;
var php = require("node-php");
var request = require('request');
var exec = require('child_process').exec;
var mysql      = require('mysql');
var EventEmitter = require("events").EventEmitter;
var body = new EventEmitter();

var d = new Date();
var light_delay = 0; //command delay in ms
var previous_data = 0;
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'device'
});

var username = "init";
var device_name = "init";
var mac = "init";
var ip = "init";
var device_port = "init";


// Fetch the computer's mac address 
require('getmac').getMac(function(err,macAddress){
  if (err)  throw err
  mac = macAddress;
})

/// create tables if the do not exist ///
var query = "create table gateway_tok (timestamp text, user text, token text, mac text, ip text, port text, device_name text)";
connection.connect();
connection.query(query, function(err, rows, fields) {
  if (err) {
    //console.log('table already exist');  
  } else {
    console.log('created gateway_tok table');
    //store device info in database
    
  }
});
/////////////////////////////////////////
    
body.on('update', function () {
  var token = body.data;
  console.log('user '+username+' | token '+token+' | mac '+mac+' | ip '+ip+' | port '+device_port+' | device_name '+ device_name);
  
  /*query = "insert";
  connection.query(query, function(err, rows, fields) {
    if (err) {
      //console.log('table already exist');  
    } else {
      console.log('created gateway_table');  
    }
  });*/    
});



/// launch device programming gui on the program_port ///
/*program_server.listen(program_port, function () {
  console.log('program GUI on port %d', program_port);
});

program_app.use(express.static(__dirname + '/public'), php.cgi("/"));
program_io.on('connection', function (socket) {
  socket.on('get_token', function (data) {
    username = data['user'];
    device_name = data['device_name'];
    ip = data['ip'];
    device_port = data['device_port']
    var response = request.post(
      'http://68.12.157.176:8080/pyfi.org/php/set_video.php',
      {form: data},
      function (error, response, data) {
        if (!error && response.statusCode == 200) {
          //console.log(body);
          body.data = data;
          body.emit('update');
        }
      }
    );
    
    console.log( Date.now() + " | token received for " + data['user']);
  });
});*/
/////////////////////////////////////////////////////

server.listen(port, function () {
  console.log('send-receive commands on port %d', port);
});

io.on('connection', function (socket) {

  socket.on('thermostat', function (data) {
    io_upstairs.emit('media', data);
    console.log( Date.now() + " upstairs " + data);
  });

  socket.on('token', function (data) {
    //get token from mysql database
    //check data['token'] w database token
    console.log('token: ' + data['token']);
    console.log( Date.now() + " valid token");
  });  
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
           send_command("perl "+__dirname+"/huepl bri 1 " + data);
           send_command("perl "+__dirname+"/huepl bri 2 " + data);
           send_command("perl "+__dirname+"/huepl bri 3 " + data);
           send_command("perl "+__dirname+"/huepl bri 4 " + data);
           send_command("perl "+__dirname+"/huepl bri 5 " + data); 
           send_command("perl "+__dirname+"/huepl bri 6 " + data); 
           send_command("perl "+__dirname+"/huepl bri 7 " + data); 
           send_command("perl "+__dirname+"/huepl bri 8 " + data);
           send_command("perl "+__dirname+"/huepl bri 9 " + data); 
           previous_data = data;
         }
      } else {
      if (data != "off") {
        send_command("perl "+__dirname+"/huepl on 1");
        send_command("perl "+__dirname+"/huepl on 2");
        send_command("perl "+__dirname+"/huepl on 3");
        send_command("perl "+__dirname+"/huepl on 4");
        send_command("perl "+__dirname+"/huepl on 5");         
        send_command("perl "+__dirname+"/huepl on 6");
        send_command("perl "+__dirname+"/huepl on 7");         
        send_command("perl "+__dirname+"/huepl on 8");
        send_command("perl "+__dirname+"/huepl on 9");         
        send_command("perl "+__dirname+"/huepl on 10");
       }
       send_command("perl "+__dirname+"/huepl "+data+" 1");
       send_command("perl "+__dirname+"/huepl "+data+" 2");
       send_command("perl "+__dirname+"/huepl "+data+" 3");
       send_command("perl "+__dirname+"/huepl "+data+" 4");
       send_command("perl "+__dirname+"/huepl "+data+" 5");
       send_command("perl "+__dirname+"/huepl "+data+" 6");
       send_command("perl "+__dirname+"/huepl "+data+" 7");
       send_command("perl "+__dirname+"/huepl "+data+" 8");
       send_command("perl "+__dirname+"/huepl "+data+" 9");
       send_command("perl "+__dirname+"/huepl "+data+" 10");
       }
  });
});

function send_command(command){
      console.log(command);
      var child = exec(command,
        function (error, stdout, stderr) {
        if (error !== null) {
          console.log('' + error);
        }
      });
}


