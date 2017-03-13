// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //


console.log("starting...");

var location_objects = [];
var device_objects = [];
var user_objects = [];
var groups = [];
var accounts = [];

var port = 5000;
// Arguments passed to the program
var index = process.argv.indexOf('-p');
if (index > -1) port = process.argv[index+1];
console.log('port ',port);

const relay = require('./relay/relay.js');
const gateway = require('./gateway/gateway.js');
