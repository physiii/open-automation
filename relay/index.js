// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //

console.log("starting relay...");

accounts = [];
groups = [];
device_objects = [];
status_objects = [];
user_objects = [];
settings = require('./settings.json');

var stream = require('./stream.js');
var website = require('./website.js');
var socket = require('./socket.js');
var express = require('express');
var http = require('http');
var app = express();

// Arguments passed to the program

/*var port = 80;
var index = process.argv.indexOf('-p');
if (index > -1) port = process.argv[index+1];


var secure_port = 443;
var index = process.argv.indexOf('-sp');
if (index > -1) secure_port = process.argv[index+1];

use_ssl = false;
var index = process.argv.indexOf('--use_ssl');
if (index > -1) {
  use_ssl = true;
}
*/
// Reroute Client request to SSL

/*app.all('*', securedirect);

function securedirect(req, res, next){
  if(req.secure){
    return next();
}
    res.redirect('https://'+ req.headers.host + req.url);
}*/

// Create and start servers

//var server = http.createServer(app);

//socket.start(server);
/*if (use_ssl){
socket.start(secure_server);
} else {
socket.start(server);
}*/

website.start(app);


