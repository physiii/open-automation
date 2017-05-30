// -----------------------------  OPEN-AUTOMATION ------------------------- //
// ------------  https://github.com/physiii/open-automation --------------- //
// --------------------------------- Gateway ------------------------------ //

var TAG = "[index.js]";
software_version = "0.2";

// ----------------------------------------------------- //
// import config or create new config.json with defaults //
// ----------------------------------------------------- //
var fs = require('fs');
config = {
  "relay_server": "127.0.0.1",
  "relay_port": 5000
}

try {
  config = require('./config.json');
} catch (e) {
  var config_str = JSON.stringify(config).replace(",","\,\n  ");
  config_str = config_str.replace("{","{\n  ").replace("}","\n}");
  fs.writeFile(__dirname + "/config.json", config_str, (err) => {
    if (err) throw err;
    console.log(TAG,"created config.json");
  });
}

// ---------------- //
// global variables //
// ---------------- //
admin = require('./admin.js');
connection = require('./connection.js');
socket = require('./socket.js');
database = require('./database');
utils = require('./utils');

thermostat = require('./devices/thermostat.js');
lights = require('./devices/lights.js');
media = require('./devices/media.js');
alarm = require('./devices/alarm.js');
camera = require('./devices/camera.js');
if (config.zwave) {
  zwave = require('./devices/zwave.js');
}

device_array= [];
/*
var querystring = require('querystring');
var io_connected = false;
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
var username = "init";
var device_name = "init";
var count = 0;
var text_timeout = 0;
var platform = process.platform;

const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
var zwave_disabled = true;
var io_relay_connected = false;
var ap_time_start;
*/


main_loop();
function main_loop () {
  setTimeout(function () {
    var settings_obj = {public_ip:connection.public_ip, local_ip:connection.local_ip, mac:utils.mac}
    database.store_settings(settings_obj);
    if (!database.got_token) {
      console.log("fetching token...");
      socket.relay.emit('get token',{mac:utils.mac, device_type:['gateway']});
    }
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
    connection.get_public_ip();
    connection.scan_wifi();
    thermostat.get_therm_state();
    for (var i = 0; i < device_array.length; i++) {
      if (device_array[i].device_type == 'thermostat') {
        thermostat.get_therm_state(device_array[i].local_ip);
      }
    }
    main_loop();
  }, 30*1000);
  //console.log(Date.now() + " | main loop");
}

