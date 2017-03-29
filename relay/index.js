// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //

console.log("starting relay...");

accounts = [];
groups = [];
device_objects = [];
location_objects = [];
user_objects = [];

var port = 5000;
// Arguments passed to the program
var index = process.argv.indexOf('-p');
if (index > -1) port = process.argv[index+1];
console.log('port ',port);

var stream = require('./stream.js');
var website = require('./website.js');
var socket = require('./socket.js');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
socket.start(server);
website.start(app,server,port);
