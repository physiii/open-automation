// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //

console.log("starting gateway...");

const utils = require('../utils.js');
const admin = require('./admin.js');
var database = require('./database.js');
const connection = require('./connection.js');
var socket = require('./socket.js');
var devices = require('./devices');
var io_connected = false;
var server_type = "dev";


process.argv.forEach(function (val, index, array) {
  //console.log(index + ': ' + val);
  if (val == "dev")
    server_type = "dev";
  if (val == "prod")
    server_type = "prod";
});


var querystring = require('querystring');

var relay_server = "init";
//var server_ip = "init";
var server_port = "init";
//get_relay_server(server_type);
/*function get_relay_server(server_type) {
  if (server_type == 'dev') {
    request.get(
    'http://pyfi.org/php/get_ip.php?server_name=socket_io_dev',
    function (error, response, data) {
      if (!error && response.statusCode == 200) {
        relay_server = data;
        var parts = relay_server.split(":");
        server_ip = parts[0];
        server_port = parts[1];
        io_relay = require('socket.io-client')("http://"+relay_server);
        start_io_relay();
        if (error !== null) {
         console.log('error ---> ' + error);
        }
      }
    }); 
  }
  if (server_type == 'prod') {
    request.get(
    'http://pyfi.org/php/get_ip.php?server_name=socket_io',
    function (error, response, data) {
      if (!error && response.statusCode == 200) {
        relay_server = data;
        var parts = relay_server.split(":");
        server_ip = parts[0];
        server_port = parts[1];
        io_relay = require('socket.io-client')('http://'+relay_server+":5000");
        start_io_relay();
        if (error !== null) {
         console.log('error ---> ' + error);
        }
      }
    });
  }
}*/

var got_token = false;
var port = process.env.PORT || 3030;
var php = require("node-php");
var spawn = require('child_process').spawn;
var SSH = require('simple-ssh');
var EventEmitter = require("events").EventEmitter;
var omit = require('object.omit');
var body = new EventEmitter();
var gb_event = new EventEmitter();
var token = "init";
var d = new Date();
var light_delay = 0; //command delay in ms
var previous_data = 0;
var desired_temp = 70;
var current_therm_state = "";
var lights = [];
//var devices = [];
var username = "init";
var device_name = "init";
var ip = "init";
var device_port = "init";
var count = 0;
var text_timeout = 0;
var platform = process.platform;
var settings_obj = {};
var device_array = {};
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
var zwave_disabled = true;
var io_relay_connected = false;

exec("mkdir files", (error, stdout, stderr) => {
  if (error) {
    //console.error(`exec error: ${error}`);
    return;
  }
  console.log("made files directory");
});

socket.relay.on('get token', function (data) {
  var settings = database.settings;
  settings.token = data.token;
  database.store_settings(settings);
  database.got_token = true;
  console.log("token received, sending settings");
  socket.relay.emit('load settings',settings);
});

socket.relay.on('set settings', function (data) {
  //data = {'device_name':data.device_name,'media_enabled':data.media_enabled,'camera_enabled':data.camera_enabled};
  database.store_settings(data);
  console.log("set settings |  ", data);
});


socket.relay.on('store_schedule', function (data) {

/*MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    var collection = db.collection('schedules');
    collection.find({'local_ip':data.local_ip}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Found:', result);
	var time = data.time;
        var schedule_obj = {};
	schedule_obj[time] = data.temperature;
	collection.update({'local_ip':data.local_ip},{$set:schedule_obj});
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
      db.close();
    });
  }
});*/
  console.log("store_schedule |  " + data);  
});

socket.relay.on('command', function (data) {
  var command = data.command;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      socket.relay.emit('command result',data);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   socket.relay.emit('command result',data);
  });
  console.log('command',command);
});

/*socket.relay.on('motion list', function (data) {
  var command = "ls -lahR --full-time /var/lib/motion/*";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      socket.relay.emit('motion list result',data);
      return;
    }
    //console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   socket.relay.emit('motion list result',data);
  });
  console.log('motion list',command);
});*/


socket.relay.on('folder list', function (data) {
  var folder = data.folder;
  var command = "ls -lah --full-time "+folder;
  console.log('folder list',command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      socket.relay.emit('folder list result',data);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   socket.relay.emit('folder list result',data);
  });
});


socket.relay.on('update', function (data) {
  var command =  ['pull'];
  const git = spawn('git', command);

  git.stdout.on('data', (data) => {console.log(`update: ${data}`)});
  git.stderr.on('data', (data) => {console.log(`stderr: ${data}`)});
  git.on('close', (code) => {});
  exec("pm2 restart relay gateway", (error, stdout, stderr) => {
    if (error) {return console.error(`exec error: ${error}`)}
    console.log(stdout);
    console.log(stderr);
  });
});


socket.relay.on('get settings', function (data) {
  console.log("!! get_settings |  ", data);
  //store_settings({'device_name':data.device_name,'device_type':data.device_type});
  database.get_settings();
});

socket.relay.on('get devices', function (data) {
  get_devices();
  console.log("get devices",data);
});

socket.relay.on('rename device', function (data) {
  console.log("!! rename device !!",data);
  database.store_settings(data);
});


var ap_time_start;
main_loop();
function main_loop () {
  setTimeout(function () {
    var settings = database.settings;
    //check_connection();
    if (database.settings.ap_mode) {
      ap_time = Date.now() - ap_time_start;
      console.log("ap_time",ap_time);
      if (ap_time > 10*60*1000) {
        console.log("trying wifi again...");
        set_wifi_from_db();
        exec("sudo reboot");
      }
    }
    utils.get_public_ip();
    connection.scan_wifi();
    devices.thermostat.get_therm_state();
    main_loop();
    for (var i = 0; i < device_array.length; i++) {
      if (device_array[i].device_type == 'thermostat') {
        get_therm_state(device_array[i].local_ip);
      }
    }
  }, 60*1000);
  console.log(Date.now() + " | main loop");
}

