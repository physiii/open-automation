// -----------------------------  OPEN-AUTOMATION ------------------------ //
// ------------  https://github.com/physiii/open-automation -------------- //
// --------------------------------- utils.js ---------------------------- //

const crypto = require('crypto');
var os = require('os');
var request = require('request');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var TAG = "[utils.js]";


module.exports = {
  find_index: find_index,
  get_mac: get_mac,
  update: update
}

// ---------------------- device info  ------------------- //
var mac = "init";
var device_type = ["gateway"];
get_mac();

// ----------------------  disk management -------------- //

var diskspace = require('diskspace');
var findRemoveSync = require('find-remove');
var _ = require('underscore');
var path = require('path');
var rimraf = require('rimraf');
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
    module.exports.disk = {free:free, total:total};
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

function update() {
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
