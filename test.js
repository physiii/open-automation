var fs = require('fs');
var os = require('os');
var express = require('express');
var app = express();
var program_app = express();
var querystring = require('querystring');
var http = require('http');
var server = http.createServer(app);
var io_relay = require('socket.io-client')('http://68.12.126.213:5000');
var port = process.env.PORT || 3030;
var php = require("node-php");
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var mysql      = require('mysql');
var EventEmitter = require("events").EventEmitter;
var body = new EventEmitter();
var gb_event = new EventEmitter();
const gb_read = require('child_process').exec;
var token = "init";
var d = new Date();
var light_delay = 0; //command delay in ms
var previous_data = 0;
var desired_temp = 70;
var current_therm_state = "";
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'device'
});
var lights = [];
var username = "init";
var device_name = "init";
var ip = "init";
var device_port = "init";
var count = 0;
var text_timeout = 0
var platform = process.platform;

// ----------------------------  program interface  ----------------------------- //
var program_server = http.createServer(program_app);
var program_io = require('socket.io')(program_server);
var program_port = 3000;
program_server.listen(program_port, function () {
  console.log('Access GUI on port %d', program_port);
});     

program_app.use(express.static(__dirname + '/public'), php.cgi("/"));
program_io.on('connection', function (socket) {
  console.log(socket.id + " connected!!")
  socket.on('ttest', function (data) {
    console.log(data['test']);
  });
  socket.on('set_wifi', function (data) {
    router_name = data['router_name'];console.log('hittt');
    router_password = data['router_password'];
  });
});
