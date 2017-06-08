// -----------------------------  OPEN-AUTOMATION ------------------------- //
// ------------  https://github.com/physiii/open-automation --------------- //
// --------------------------------- Gateway ------------------------------ //

software_version = "0.2";
var TAG = "[index.js]";

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

main_loop();
function main_loop () {
  setTimeout(function () {
    var settings_obj = {public_ip:connection.public_ip, local_ip:connection.local_ip, mac:utils.mac, disk:utils.disk};
    //console.log(TAG,settings_obj);
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

