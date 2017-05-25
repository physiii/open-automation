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


// Reroute Client request to SSL

/*
app.all('*', securedirect);
function securedirect(req, res, next){
  if(req.secure){
      return next();
  }
    res.redirect('https://'+ req.headers.host + req.url);
}
*/


website.start(app);


