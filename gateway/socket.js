// -----------------------------  OPEN-AUTOMATION ------------------------- //
// ------------  https://github.com/physiii/open-automation --------------- //
// -------------------------------- socket.js ----------------------------- //

var exec = require('child_process').exec;
var TAG = "[socket.js]";
var relay_server = config.relay_server;
var relay_port = config.relay_port;
var relay = require('socket.io-client')("http://"+relay_server+":"+relay_port);
console.log('Connected to:',relay_server+":"+relay_port);
//var load_settings_timer;

module.exports = {
  relay: relay
}

relay.on('get token', function (data) {
  var settings = database.settings;
  settings.token = data.token;
  database.store_settings(settings);
  database.got_token = true;
  if (software_version)
   settings.software_version = software_version;
  else settings.software_version = "NA";
  console.log("token received, sending settings");
  relay.emit('load settings',settings);
});

relay.on('loaded settings', function (data) {
  //console.log('loaded settings |',data.mac);
  //clearTimeout(load_settings_timer);
});

relay.on('set settings', function (data) {
  //data = {'device_name':data.device_name,'media_enabled':data.media_enabled,'camera_enabled':data.camera_enabled};
  database.store_settings(data);
  console.log("set settings |", data.mac);
});

relay.on('store_schedule', function (data) {
  console.log("store_schedule |  " + data);  
});

relay.on('room_sensor', function (data) {
  //console.log("room_sensor", data);
  if (data.mode == 'armed' && data.motion == 'Motion Detected') {
    alert = true;
    set_theme('alert');
  }
  if (data.status == 'disarmed') {
    alert = false;
    set_theme('presence');
  }
});

relay.on('motion_sensor', function (data) {
  console.log("motion_sensor", data);
  if (data.mode == 'armed') {
    alert = true;
    set_theme('alert');
  }
  if (data.status == 'disarmed') {
    alert = false;
    set_theme('presence');
  }
});

relay.on('window_sensor', function (data) {
  var _mac = data.mac;
  var _magnitude = data.magnitude;
  console.log( _mac + " | window_sensor data " + _magnitude);
});

relay.on('gateway', function (data) {
  console.log(mac + " | " + data.command);
});

relay.on('command', function (data) {
  var command = data.command;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      relay.emit('command result',data);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   relay.emit('command result',data);
  });
  console.log('command',command);
});

relay.on('update', function (data) {
  utils.update();
});

/*function start_settings_timer() {
  load_settings_timer = setTimeout(function () {
    console.log("load_settings_timer | no reply from server");
    exec("pm2 restart all", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });    
    start_settings_timer();
  }, 3000);
}*/

relay.on('get settings', function (data) {
  var settings = database.settings;
  relay.emit('load settings', settings);
  console.log(TAG,"sending load settings |", settings.mac);
  //start_settings_timer();
});

relay.on('get devices', function (data) {
  //console.log("get devices",data);
  database.get_devices();
});

relay.on('rename device', function (data) {
  console.log("!! rename device !!",data);
  database.store_settings(data);
});

relay.on('media', function (data) {
  media.command(data);
});

relay.on('set alarm', function (data) {
  alarm.set_alarm(data);
});

relay.on('add zwave', function (data) {
    //var secure_device = data.secure_device;
    var secure_device = true;
    /*if (zwave.hasOwnProperty('beginControllerCommand')) {
      console.log("searching for nodes");
      zwave.beginControllerCommand('AddDevice', secure_device);
    } else {*/
      console.log("searching for nodes!");
      zwave.add_node(secure_device);
    //}
});

relay.on('set zwave', function (data) {
  console.log("set zwave",data);
  //try {
    //zwave.setValue(data.node_id, 98, 1, 0, data.value);
    //zwave.setValue(data.node_id, 112, 1, 7, 'Activity');
    zwave.set_value(data.node_id, data.class_id, data.instance, data.index, data.value);
  //} catch (e) { console.log(e) }
});

relay.on('media', function (data) {
  media.command(data);
});

relay.on('add thermostat', function (data) {
  console.log("add thermostat",data);
  thermostat.add_thermostat(data);
});

relay.on('get thermostat', function (data) {
  device = data.device;
  thermostat.get_therm_state(device.local_ip);
  //console.log("get thermostat",data);  
});

relay.on('set thermostat', function (data) {
  thermostat.set_thermostat(data);
});

relay.on('set lights', function (data) {
  //data.light = omit(data.light,"$$hashKey"); //bad angularjs array
  lights.set_light(data.light.id,data.light.state);
  //console.log("set lights", data.light);
});

relay.on('link lights', function (data) {
  find_hue_bridge();
  console.log("link lights");
});

relay.on('disconnect', function(data) {
  console.log("disconnected, setting got_token false",data);
  database.got_token = false;
});

