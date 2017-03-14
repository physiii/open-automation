// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //

console.log("starting relay...");

accounts = [];
groups = [];
device_objects = [];
user_objects = [];

var utils = require('../utils.js');
var stream = require('./stream.js');
var website = require('./website.js');
var socket = require('./socket.js');
var express = require('express');
var app = express();
var port = 5000;
var server = require('http').createServer(app);
socket.start(server);
website.start(app,server,port);
