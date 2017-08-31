// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ----------------------------- physiphile@gmail.com -------------------------------- //


// ----------------------------------------------------- //
// import config or create new config.json with defaults //
// ----------------------------------------------------- //
var fs = require('fs');
config = {
  "use_ssl": false,
  "use_domain_ssl": false,
  "website_port": 5000,
  "website_secure_port": 443,
  "video_websocket_port": 8084,
  "video_stream_port": 8082,
  "device_port": 4000
}

try {
  config = require('./config.json');
} catch (e) {
  var config_str = JSON.stringify(config).replace(",","\,\n  ");
  config_str = config_str.replace("{","{\n  ").replace("}","\n}");
  fs.writeFile(__dirname + "/config.json", config_str, (err) => {
    if (err) throw err;
    console.log("created config.json");
  });
}

// ---------------- //
// global variables //
// ---------------- //
accounts = [];
groups = [];
device_objects = [];
device_sockets = [];
status_objects = [];
user_objects = [];
user_sockets = [];

var stream = require('./stream.js');
var website = require('./website.js');
var socket = require('./socket.js');
var express = require('express');
var http = require('http');
var app = express();



// ------------- //
// start servers //
// ------------- //
website.start(app);


