// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- lights.js -------------------------------------- //

var database = require('../database.js');

module.exports = {
  set_light: set_light,
  find_lights: find_lights,
  create_user: create_user,
  find_hue_bridge: find_hue_bridge,
  set_theme: set_theme
}

var red = {"on":true,"rgb":[255,0,0],"bri":"255"};
var blue = {"on":true,"rgb":[0,0,255],"bri":"255"};
var state = red;
var presence = {"on":true,"bri":"100"};
var alert = false;
function set_theme(theme) {
  if (alert == true) {
    setTimeout(function () {
      set_theme('alert');
    }, 2*1000);
    if (state == red) {
      state = blue;
    } else 
    if (state == blue) {
      state = red;
    }
    else state = red;
  }
  for (var i = 0; i < device_array.length; i++) {
    if (device_array[i].device_type == "lights") {
      hue = new HueApi(device_array[i].ipaddress,device_array[i].user);
      for (var j = 0; j < device_array[i].lights.length; j++) {
        if (theme == 'presence') {
          if (device_array[i].lights[j].on) continue;
          state = presence;
        }
        set_light(device_array[i].lights[j].id,state);
      }
    }
  }
}

// ----------------------  link bridge  ------------------- //
var HueApi = require("node-hue-api").HueApi;
//var hue_obj = {host:"init",user:"init",userDescription:"Gateway"};
function find_hue_bridge() {
  var hue = require("node-hue-api");
  hue.nupnpSearch(function(err, result) {
	console.log("find_hue_bridge",result);
    if (err) throw err;
    found_bridge = false;  
    for (var i = 0; i < device_array.length; i++) {
      if (device_array[i].id == result[0].id) {
	console.log("bridge already exist, creating user...");
	create_user(result[0]);
	found_bridge = true;
      }
    }
    if (found_bridge == false) {
      console.log("new bridge, creating user...");
      device_array.push(result[0]);
      database.store_device(result[0])
      create_user(result[0]);
    }
  });
}

function create_user(device) {
  hue = new HueApi();
  hue.createUser(device.ipaddress, function(err, user) {
    if (err) console.log(err);
    for (var i = 0; i < device_array.length; i++) {
      if (device_array[i].id == device.id) {
        device_array[i].user = user;
	device_array[i].device_type = "lights";
	device_array[i].local_ip = utils.local_ip;
 	//device_array[i].token = token;
  	//device_array[i].mac = mac;
	//database.store_device(device_array[i]);
	find_lights(device_array[i]);
        console.log("created user",device_array[i]);
     }
   }
  });
}

// ----------------------  finding lights  ------------------- //
function find_lights(device) {
  hue = new HueApi(device.ipaddress,device.user);
  hue.lights(function(err, lights) {
    if (err) console.log(err);
    for (var i = 0; i < device_array.length; i++) {
      if (device_array[i].id == device.id) { 
        if (!lights) return console.log("find_lights | ",lights); 
	device_array[i].lights = lights.lights;
        database.store_device(device_array[i]);
        console.log("storing lights");
      }
   }
  });
}

// --------------------  setting light state  ----------------- //
function set_light(device_id,state) {
  console.log("set_light",state);
  for (var i = 0; i < device_array.length; i++) {
    if (device_array[i].device_type == "lights") {
      hue = new HueApi(device_array[i].ipaddress,device_array[i].user);
      hue.setLightState(device_id, state, function(err, results) {
        if (err) console.log(err);
      });
      find_lights(device_array[i]);
    }
  }
}
