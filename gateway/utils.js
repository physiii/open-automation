// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// --------------------------------- utils.js --------------------------------------- //

module.exports = {
  find_index: find_index,
  get_mac: get_mac,
  get_local_ip: get_local_ip,
  update: update,
  get_public_ip: get_public_ip
}

const crypto = require('crypto');
var os = require('os');
var database = require('./database');
var request = require('request');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;


main_loop();
function main_loop () {
  setTimeout(function () {
    var settings_obj = {public_ip:utils.public_ip, local_ip:utils.local_ip, mac:utils.mac}
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
    utils.get_public_ip();
    connection.scan_wifi();
    devices.thermostat.get_therm_state();
    for (var i = 0; i < device_array.length; i++) {
      if (device_array[i].device_type == 'thermostat') {
        get_therm_state(device_array[i].local_ip);
      }
    }
    main_loop();
  }, 60*1000);
  //console.log(Date.now() + " | main loop");
}

// ---------------------- device info  ------------------- //
var local_ip = "init";
var ifaces = os.networkInterfaces();
var mac = "init";
var device_type = ["gateway"];
//var device_name = "Gateway";
var public_ip = "init";
get_public_ip();
get_local_ip();
get_mac();
main_loop();


function get_local_ip() {
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      //console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      //console.log(ifname, iface.address);
    }
    local_ip = iface.address;
    ++alias;
    module.exports.local_ip = local_ip;
  });
});
}

function get_public_ip() {
  request.get(
  'https://pyfi.org/get_ip',
  function (error, response, data) {
    if (!error && response.statusCode == 200) {
      public_ip = data;
      module.exports.public_ip = public_ip;
      database.store_settings({"public_ip":public_ip});
      //console.log("stored public_ip",public_ip);
      if (error !== null) console.log(error);
    }
  });
}


// ----------------------  disk management --------------------- //
var diskspace = require('diskspace');
var findRemoveSync = require('find-remove');
var _ = require('underscore');
var path = require('path');
var rimraf = require('rimraf');
var free_space = 0;
timeout();
check_diskspace();
function timeout() {
  setTimeout(function () {
    check_diskspace();
    timeout();
  }, 60*60*1000);
}

function check_diskspace() {
  diskspace.check('/', function (err, total, free, status)
  {
    //console.log("free space: " + free);
    if (free < 2000000000) {
      remove_old_files();
    }
    var info = {free:free, total:total}
    return info;
  });
}

function remove_old_files() {
      // Return only base file name without dir
      var oldest_dir = getMostRecentFileName('/var/lib/motion');
      try {
       var result = findRemoveSync('/var/lib/motion/' + oldest_dir, {age: {seconds: 0}}, {files: '*'});
rimraf('/var/lib/motion/' + oldest_dir, function(error) {
        if(error) {
          console.log(error);
        } else {
          console.log('Files deleted');
        }
      });
      console.log("removed old files | " + oldest_dir);
      }
      catch (e) {
	console.log(e);
      }
}


function get_mac () {
  require('getmac').getMac(function(err,macAddress){
    if (err)  throw err
    mac = macAddress.replace(/:/g,'').replace(/-/g,'').toLowerCase();
    var token = crypto.createHash('sha512').update(mac).digest('hex');
    console.log("Device ID: " + mac);
    module.exports.mac = mac;
  });
}

// ----------------------  update  --------------------- //

function update () {
  var path = __dirname.replace("/gateway","");
  console.log("pull from ", path)
  var command =  ['-C', path, 'pull'];
  var git = spawn('git', command);
  git.stdout.on('data', (data) => {console.log(`update: ${data}`)});
  git.stderr.on('data', (data) => {console.log(`stderr: ${data}`)});
  git.on('close', (code) => {});
  exec("pm2 restart gateway", (error, stdout, stderr) => {
    if (error) {return console.error(`exec error: ${error}`)}
    console.log(stdout);
    console.log(stderr);
  });
}

function main_loop () {
setTimeout(function () {
  get_public_ip();
  main_loop();
  //console.log("main loop");
}, 60*1000);
}

function find_index(array, key, value) {
  for (var i=0; i < array.length; i++) {
    if (array[i][key] == value) {
      return i;
    }
  }
  return -1;
}

function getMostRecentFileName(dir) {
  var files = fs.readdirSync(dir);
  return _.min(files, function (f) {
    var fullpath = path.join(dir, f);
    return fs.statSync(fullpath).ctime;
  });
}
