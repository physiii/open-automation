// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// --------------------------------- thermostat.js ----------------------------------- //

module.exports = {
  add_thermostat: add_thermostat,
  set_thermostat: set_thermostat,
  get_therm_state: get_therm_state
}

var request = require('request');

/*var ping_time = Date.now();
function send_ping(){
  ping_time = Date.now();
  console.log('sending ping...');
  socket.relay.emit('png_test');
}*/

var data_obj = {};
function add_thermostat(data) {
console.log("add thermostat | " + data.local_ip);
request.get(
'http://'+data.local_ip+'/tstat',
function (error, response, data2) {
  if (!error && response.statusCode == 200) {
    console.log('thermostat says: ' + data2);
    if (isJSON(data2)) { 
      data_obj = {};
      data_obj['current_state'] = JSON.parse(data2);
      data_obj['token'] = database.token;
      data_obj['mac'] = utils.mac;
      data_obj['device_type'] = 'thermostat';
      data_obj['local_ip'] = data.local_ip;
      data_obj['device_name'] = data.device_name;
      data_obj['schedule'] = {"7 AM":70,"9 AM":70,"11 AM":70,"1 PM":70,"3 PM":70,"5 PM":70,"7 PM":70,"9 PM":70,"11 PM":70,"1 AM":70};
      //var device_obj = {device_type:"thermostat", device_name:data_obj.device_name, local_ip:data_obj.local_ip, schedule:data_obj.schedule};
      database.store_device(data_obj);
      device_array.push(data_obj);
      socket.relay.emit('thermostat_state',data_obj);
    }
    if (error !== null) {
     console.log('add thermostat | ' + error);
    }
  }
});

}

function set_thermostat(device) {
  //console.log("set_thermostat",device.set_state);
  var request = require('request');
  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:     'http://'+device.local_ip+'/tstat',
    body:    JSON.stringify(device.set_state)
  }, function(error, response, body){
    console.log('set_thermostat',body);
    get_therm_state(device.local_ip);
  });
}

function get_therm_state(ipaddress) {
  //console.log("get_therm_state",ipaddress);
  request.get(
  'http://'+ipaddress+'/tstat',
  function (error, response, data) {
    if (!error && response.statusCode == 200) {
      if (isJSON(data)) { 
        var data_obj = {};    
        data_obj = JSON.parse(data);
        for (var i = 0; i < device_array.length; i++) {
	  if (device_array[i].local_ip == ipaddress) {
	    device_array[i].current_state = data_obj;
            database.store_device(device_array[i]);
            //console.log("get_therm_state",data_obj);
	  }
	}
      }
      if (error !== null) console.log('get_therm_state |' + error);
    }
  });
}

/*function send_command(command) {
  console.log(command);
  var child = exec(command,
  function (error, stdout, stderr) {
    if (error !== null) {
      console.log('' + error);
    }
    if (stderr !== null) {
      console.log("stderr!!!");
    }
  });
}*/

function isJSON (json_obj) {
  if (/^[\],:{}\s]*$/.test(json_obj.replace(/\\["\\\/bfnrtu]/g, '@').
  replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
  replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
    return true;
  }else{
    return false;
  }  
}
