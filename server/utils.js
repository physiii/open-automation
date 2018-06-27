// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //


module.exports = {
  onChange,
  find_index,
  get_mac,
  get_local_ip,
  get_public_ip
}

const crypto = require('crypto'),
	request = require('request'),
	exec = require('child_process').exec;
	os = require('os'),
	fs = require('fs');

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
  'http://pyfi.org/php/get_ip.php',
  function (error, response, data) {
    if (!error && response.statusCode == 200) {
      public_ip = data;
      module.exports.public_ip = public_ip;
      if (error !== null) console.log(error);
    }
  });
}

function onChange (object, onChange) {
  const handler = {
    get (target, property, receiver) {
      let value = target[property];

      const tag = Object.prototype.toString.call(value),
        shouldBindProperty = (property !== 'constructor') && (
          tag === '[object Function]' ||
          tag === '[object AsyncFunction]' ||
          tag === '[object GeneratorFunction]'
        );

      if (shouldBindProperty) {
        value = value.bind(target);
      }

      try {
        return new Proxy(value, handler);
      } catch (err) {
        return Reflect.get(target, property, receiver);
      }
    },
    defineProperty (target, property, descriptor) {
      const result = Reflect.defineProperty(target, property, descriptor);
      onChange();
      return result;
    },
    deleteProperty (target, property) {
      const result = Reflect.deleteProperty(target, property);
      onChange();
      return result;
    }
  };

  return new Proxy(object, handler);
}


// ----------------------  disk management ------------------- //
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
  }, 30*1000);
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

// -------------------------------------------------------------- //
function get_mac () {
  require('getmac').getMac(function(err,macAddress){
    if (err)  throw err
    mac = macAddress.replace(/:/g,'').replace(/-/g,'').toLowerCase();
    var token = crypto.createHash('sha512').update(mac).digest('hex');
    console.log("Mac: (" + mac + ")");
    module.exports.mac = mac;
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
