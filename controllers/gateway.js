// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //

var server_type = "dev";
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  if (val == "dev")
    server_type = "dev";
  if (val == "prod")
    server_type = "prod";
});

var fs = require('fs');
var os = require('os');
var express = require('express');
var program_app = express();
var querystring = require('querystring');
var request = require('request');
var relay_server = "init";
var server_ip = "init";
var server_port = "init";
var io_relay;
get_relay_server(server_type);
function get_relay_server(server_type) {
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
}
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
var devices = [];
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

// -------------------------------  MangoDB  --------------------------------- //
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;

//-- initialize variables --//
get_devices();
function set_wifi_from_db() {
  console.log("set_wifi_from_db");
  MongoClient.connect('mongodb://127.0.0.1:27017/settings', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('settings');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
  	  settings_obj = result[0];
  	  set_wifi(settings_obj);
 	  //console.log('initialize variables | ',settings_obj);
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
}
set_wifi_from_db();

//-- get and send settings object --//
function get_settings() {
  MongoClient.connect('mongodb://127.0.0.1:27017/settings', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('settings');
      collection.find().toArray(function (err, result) {
        if (err) { 
	  console.log(err);
        } else if (result.length) {
	  settings_obj = result[0];
	  if (settings_obj.gateway_enabled && zwave_disabled) {
	    init_zwave();
	    zwave_disabled = false;
  	  }
	  if (got_token == false && io_relay_connected) {
	    got_token = true;
	    io_relay.emit('get token',{ mac:mac, local_ip:local_ip, device_type:["gateway"], device_name:settings_obj.device_name });
  	  }
        } else {
	  console.log('No document(s) found with defined "find" criteria!');
        }
        settings_obj.devices = device_array;
        if (io_relay_connected) {     
          console.log('!! load settings !!');
          io_relay.emit('load settings',settings_obj);
        }
        db.close();
      });
    }
  });
}

//-- store new settings --//
function store_settings(data) {
  MongoClient.connect('mongodb://127.0.0.1:27017/settings', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('settings');
      //console.log('store_settings',data);
      collection.update({}, {$set:data}, {upsert:true}, function(err, item){
        //console.log("item",item)
      });
      db.close();
    }
  });
  get_settings();
}

//-- store new device --//
function store_device(device) {
  delete device["_id"];
  MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('devices');
      collection.update({id:device.id}, {$set:device}, {upsert:true}, function(err, item){
        //console.log("update device: ",item)
      });
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
	  device_array = result;
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
      });
      db.close();
    }
  });
  get_devices();
}

//-- load devices from database --//
function get_devices() {
  MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('devices');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
	  //device_array = {};
	  device_array = result;
          get_settings();
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
  console.log("!! get_devices !!");
}
var ap_time_start;
main_loop();
function main_loop () {
  setTimeout(function () {
    //check_connection();
    if (ap_mode) {
      ap_time = Date.now() - ap_time_start;
      console.log("ap_time",ap_time);
      if (ap_time > 10*60*1000) {
        console.log("trying wifi again...");
        set_wifi_from_db();
        exec("sudo reboot");
      }
    }
    get_public_ip();
    scan_wifi();
    get_therm_state();
    main_loop();
    for (var i = 0; i < device_array.length; i++) {
      if (device_array[i].device_type == 'thermostat') {
        get_therm_state(device_array[i].local_ip);
      }
    }
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

function get_local_ip () {
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
    port = local_ip.split('.');
    port = "30" + port[3];
    settings_obj.port = port;
    var rc_local = "#!/bin/sh -e\n"
		 + "#\n"
		 + "# rc.local\n"
		 + "#\n"
		 + "# This script is executed at the end of each multiuser runlevel.\n"
		 + "# Make sure that the script will \"exit 0\" on success or any other\n"
		 + "# value on error.\n"
		 + "#\n"
		 + "# In order to enable or disable this script just change the execution\n"
		 + "# bits.\n"
		 + "#\n"
		 + "# By default this script does nothing.\n"
		 + "#sudo modprobe bcm2835-v4l2\n"
		 + "sudo modprobe v4l2loopback video_nr=10,11,1\n"
		 + "ffmpeg -loglevel panic -f video4linux2 -i /dev/video0 -vcodec copy -f v4l2 /dev/video10 -vcodec copy -f v4l2 /dev/video11 2>&1 &\n"
                 + "export DISPLAY=':0.0'\n"
                 + "#su pi -c 'cd ~/open-automation/motion && ./motion -c motion-mmalcam-both.conf >> /var/log/motion 2>&1 &'\n"
                 + "su pi -c 'cd ~/open-automation && sudo pm2 start gateway.js relay.js'\n"
                 + "exit 0;\n"
    /*fs.writeFile("/etc/rc.local", rc_local, function(err) {
      if(err) {
        return console.log(err);
      }
      //console.log("writing rc.local");
    });*/
    settings_obj.local_ip = local_ip;
    store_settings(settings_obj);
  });
});
}

function get_mac () {
require('getmac').getMac(function(err,macAddress){
  if (err)  throw err
  mac = macAddress.replace(/:/g,'').replace(/-/g,'').toLowerCase();
  store_settings({mac:mac});
  console.log("Enter device ID (" + mac + ") at http://pyfi.org");
    var hostapd_file = "interface=wlan0\n"
		       + "driver=nl80211\n"
		       + "ssid=Gateway " + mac + "\n"
		       + "hw_mode=g\n"
		       + "channel=6\n"
		       + "ieee80211n=1\n"
		       + "wmm_enabled=1\n"
		       + "ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]\n"
		       + "macaddr_acl=0\n"
		       + "auth_algs=1\n"
		       + "ignore_broadcast_ssid=0\n"
		       + "wpa=2\n"
		       + "wpa_key_mgmt=WPA-PSK\n"
		       + "wpa_passphrase=raspberry\n"
		       + "rsn_pairwise=CCMP\n";

    fs.writeFile("/etc/hostapd/hostapd.conf", hostapd_file, function(err) {
      if(err) {
        return console.log(err);
      }
      //console.log("hostapd_file saved!");
    });
});
}

function get_public_ip() {
  request.get(
  'http://pyfi.org/php/get_ip.php',
  function (error, response, data) {
    if (!error && response.statusCode == 200) {
      public_ip = data;
      settings_obj.public_ip = public_ip;
      //console.log('public_ip ' + data);
      store_settings({public_ip:public_ip});
      if (error !== null) {
       console.log('error ---> ' + error);
      }      
    }
  });
}

// -------------------------------  connection  -------------------------------- //
var router_array = [];
var router_list = [];
var ap_mode = false;
scan_wifi();
var bad_connection = 0;
function check_connection() {
  var ping = require ("ping");
  host = "8.8.8.8";
  ping.sys.probe(host, function(isAlive) {
    var msg = isAlive ? 'alive' : 'dead';
    if (msg == 'dead') {
      bad_connection++;
      console.log('bad_connection',bad_connection);
      if (!ap_mode && bad_connection > 1) {
        var interfaces_file = "allow-hotplug wlan0\n"
                   + "iface wlan0 inet static\n"
    		   + "address 172.24.1.1\n"
    		   + "netmask 255.255.255.0\n"
    		   + "network 172.24.1.0\n"
    		   + "broadcast 172.24.1.255\n";
        fs.writeFile("/etc/network/interfaces", interfaces_file, function(err) {
          if(err) return console.log(err);
          console.log("Interface file saved, starting AP");
          exec("sudo ifdown wlan0 && sudo ifup wlan0 && sudo service dnsmasq restart && sudo hostapd /etc/hostapd/hostapd.conf");
          ap_mode = true;
          ap_time_start = Date.now();
        });
        bad_connection = 0;
      }
    }
    if (msg == 'alive') {
      bad_connection = 0;
    }
  });
}

function scan_wifi() {
//if (ap_mode == true) {
  exec("sudo iwlist wlan0 scan | grep 'ESSID'", (error, stdout, stderr) => {
    if (error) {
      //console.error(`exec error: ${error}`);
      return;
    }
    router_array = stdout.split('\n');
    router_list = [];
    for(var i = 0; i < router_array.length; i++) {
      var router_ssid = router_array[i].replace(/^\s*/, "")
  			             .replace(/\s*$/, "")
 			             .replace("ESSID:\"","")
    			             .replace("\"","");
      router_list.push({ssid:router_ssid});
    }
    settings_obj.router_list = router_list;
    store_settings(settings_obj);
    //console.log("router_array | " + settings_obj.router_list);
  });
//}
}

function set_wifi(data) {

    var wpa_supplicant = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n"
                       + "update_config=1\n"
		       + "country=GB\n"
                       + "network={\n"
		       + "ssid=\""+data.router_name+"\"\n"
		       + "psk=\""+data.router_password+"\"\n"
		       + "key_mgmt=WPA-PSK\n"
		       + "}\n";
    var interfaces_file = "source-directory /etc/network/interfaces.d\n"
			+ "auto lo\n"
			+ "iface lo inet loopback\n"
			+ "iface eth0 inet manual\n"
			+ "allow-hotplug wlan0\n"
			+ "iface wlan0 inet manual\n"
		    	+ "    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf\n";

    fs.writeFile("/etc/wpa_supplicant/wpa_supplicant.conf", wpa_supplicant, function(err) {
      if(err) {
        return console.log(err);
      }
      fs.writeFile("/etc/network/interfaces", interfaces_file, function(err) {
        if(err) {
          return console.log(err);
        }
        exec("sudo /bin/sh -c 'if ! [ \"$(ping -c 1 8.8.8.8)\" ]; then echo \"resetting wlan0\" && sudo ifdown wlan0 && sudo ifup wlan0; else echo \"connection is good\"; fi'", (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(stdout);
          console.log(stderr);
          ap_mode = false;
          setTimeout(function () {
            //check_connection();
          }, 30*1000);
        });
      });
    });
  console.log("set_wifi");
}
/* ----------------------------  program interface  ----------------------------- */
var program_port = 3000;
var program_server = program_app.listen(program_port);
var program_io = require('socket.io')(program_server);

program_server.listen(program_port, function () {
  console.log('Access GUI on port %d', program_port);
});     

program_app.use(express.static(__dirname + '/public'), php.cgi("/"));
program_io.on('connection', function (socket) {
  console.log(socket.id + " connected");
  socket.emit('router_array',router_list);

  socket.on('set wifi', function (data) {
    console.log("set wifi",data);
    store_settings(data);
    set_wifi(data);
    exec("sudo reboot");
  });
});

// -------------------------  zwave  ---------------------- //
var nodes = [];
var OpenZWave = require('openzwave-shared');
var zwave = new OpenZWave({
	ConsoleOutput: false,
	Logging: false,
	SaveConfiguration: false,
	DriverMaxAttempts: 3,
	PollInterval: 500,
	SuppressValueRefresh: true,
	NetworkKey: "0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F,0x10"
});

function init_zwave() {
zwave.on('connected', function(homeid) {
	//console.log('=================== CONNECTED! ====================');
});

zwave.on('driver ready', function(homeid) {
	console.log('=================== DRIVER READY! ====================');
	console.log('scanning homeid=0x%s...', homeid.toString(16));
//console.log("adding node");
//zwave.addNode(1);
});

zwave.on('driver failed', function() {
	console.log('failed to start driver');
	//zwave.disconnect();
	//process.exit();
});

zwave.on('node added', function(nodeid) {
	console.log('=================== NODE ADDED! ====================',nodeid);
	nodes[nodeid] = {
		manufacturer: '',
		manufacturerid: '',
		product: '',
		producttype: '',
		productid: '',
		type: '',
		name: '',
		loc: '',
		classes: {},
		ready: false,
	};
});

zwave.on('value added', function(nodeid, comclass, value) {
  if (!nodes[nodeid]['classes'][comclass])
    nodes[nodeid]['classes'][comclass] = {};
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

setTimeout(function () {
  //hard_reset();
  //remove_node();
}, 30*1000);

function remove_node() {
  console.log("remove node...");
  zwave.removeNode();
}

function hard_reset() {
  console.log("hard reset...");
  zwave.hardReset();
}

zwave.on('value changed', function(nodeid, comclass, value) {

  if (nodes[nodeid]['ready']) {
    console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
      value['label'],
      nodes[nodeid]['classes'][comclass][value.index]['value'],
      value['value']);
   
    console.log("value changed",nodes[nodeid].product);
    store_device(nodes[nodeid]);
  }
  nodes[nodeid]['classes'][comclass][value.index] = value;
});

zwave.on('value removed', function(nodeid, comclass, index) {
	if (nodes[nodeid]['classes'][comclass] &&
	    nodes[nodeid]['classes'][comclass][index])
		delete nodes[nodeid]['classes'][comclass][index];
});
zwave.on('node ready', function(nodeid, nodeinfo) {
	nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
	nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
	nodes[nodeid]['product'] = nodeinfo.product;
	nodes[nodeid]['producttype'] = nodeinfo.producttype;
	nodes[nodeid]['productid'] = nodeinfo.productid;
	nodes[nodeid]['type'] = nodeinfo.type;
	nodes[nodeid]['name'] = nodeinfo.name;
	nodes[nodeid]['loc'] = nodeinfo.loc;
	nodes[nodeid]['ready'] = true;
	nodes[nodeid]['id'] = nodeid;
	nodes[nodeid]['device_type'] = nodeinfo.type;
	nodes[nodeid]['local_ip'] = local_ip;

	console.log('node%d: %s, %s', nodeid,
		    nodeinfo.manufacturer ? nodeinfo.manufacturer
					  : 'id=' + nodeinfo.manufacturerid,
		    nodeinfo.product ? nodeinfo.product
				     : 'product=' + nodeinfo.productid +
				       ', type=' + nodeinfo.producttype);
	console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
		    nodeinfo.name,
		    nodeinfo.type,
		    nodeinfo.loc);
   	store_device(nodes[nodeid]);
	for (var comclass in nodes[nodeid]['classes']) {
		switch (comclass) {
		case 0x25: // COMMAND_CLASS_SWITCH_BINARY
		case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
			zwave.enablePoll(nodeid, comclass);
			break;
		}
		var values = nodes[nodeid]['classes'][comclass];
		console.log('node%d: class %d', nodeid, comclass);
		for (var idx in values)
			console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[idx]['value']);
	}
});

zwave.on('notification', function(nodeid, notif, help) {
	console.log('node%d: notification(%d): %s', nodeid, notif, help);
});

zwave.on('scan complete', function() {
	console.log('zwave scan complete');
});

var zwavedriverpaths = {
	"darwin" : '/dev/cu.usbmodem1411',
	"linux"  : '/dev/ttyUSB0',
	"windows": '\\\\.\\COM3'
}
console.log("connecting to " + zwavedriverpaths[os.platform()]);
zwave.connect( zwavedriverpaths[os.platform()] );

process.on('SIGINT', function() {
	console.log('disconnecting...');
	zwave.disconnect();
	process.exit();
});
}

// ----------------------  check disk space  ------------------- //
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
    store_settings({free_space:free,total_space:total})
    if (free < 2000000000) {
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
  });
}

function getMostRecentFileName(dir) {
  var files = fs.readdirSync(dir);
  return _.min(files, function (f) {
    var fullpath = path.join(dir, f);
    return fs.statSync(fullpath).ctime;
  });
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
      store_device_object(result[0])
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
	device_array[i].local_ip = local_ip;
 	//device_array[i].token = token;
  	//device_array[i].mac = mac;
	//store_device(device_array[i]);
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
	device_array[i].lights = lights.lights;
        store_device(device_array[i]);
        console.log("storing lights");
      }
   }
  });
}

// --------------------  setting light state  ----------------- //
function set_light(device_id,state) {
  //console.log("set_light",state);
  for (var i = 0; i < device_array.length; i++) {
    if (device_array[i].device_type == "lights") {
  
      hue = new HueApi(device_array[i].ipaddress,device_array[i].user);
      hue.setLightState(device_id, state, function(err, results) {
        if (err) console.log(err);
      });
      //find_lights(device_array[i]);
    }
  }
}

//---------------------- socket.io -------------------//
var got_token = false;
function start_io_relay() {
io_relay_connected = true;
console.log('socket io connected:',relay_server);
get_settings();
io_relay.on('get token', function (data) {
  token = data.token;
  session_string = '/' + token;
  settings_obj.token = token;
  settings_obj.mac = mac;
  store_settings(settings_obj);
  got_token = true;
  console.log("get token", token);
});

io_relay.on('store_schedule', function (data) {

MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
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
});
  console.log("store_schedule |  " + data);  
});



io_relay.on('camera', function (data) {
  //if (data.command == 'snapshot')
  //if (data.command == 'preview')
  //get_camera_preview();
});

io_relay.on('get camera preview', function (data) {
  //if (data.command == 'snapshot')
  //if (data.command == 'preview')
  get_camera_preview();
});

function get_camera_preview() {
  var root_dir = "/var/lib/motion";
  var command = "ls -lahRt --full-time "+root_dir+" | head -100";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.log(`error: ${error}`);
      return;
    }
    stdout = stdout.split(/(?:\r\n|\r|\n)/g);
    var cur_dir = "";
    for (var i =0; i < stdout.length; i++) {
      stdout[i] = stdout[i].split(" ");
      if (stdout[i][0].indexOf("/") > -1) {
        stdout[i][0] = stdout[i][0].replace(":","/");
        cur_dir = stdout[i][0];
      }
      stdout[i][9] = cur_dir + stdout[i][9];
      if (!stdout[i][9]) continue;
      if (stdout[i][9].indexOf(".jpg") > -1) {
        send_camera_preview(stdout[i][9]);
        return console.log("get_camera_preview",stdout[i][9]);
      }
      
    }
  });
}

function send_camera_preview (path) {
  fs.readFile(path, function(err, data) {
    if (err) return console.log(err); // Fail if the file can't be read.
    data_obj = {mac:settings_obj.mac, token:settings_obj.token, image:data.toString('base64')}
    io_relay.emit('camera preview',data_obj);
  });
}

ffmpeg_timer = setTimeout(function () {}, 1);
io_relay.on('ffmpeg', function (data) {
  if (data.command == "start_webcam") {
    start_ffmpeg(data);
  }
  if (data.command == "stop") {
    console.log("received ffmpeg stop command");
    stop_ffmpeg(ffmpeg);
  }
  if (data.command == "play_file") {
    console.log("playing file");
    start_ffmpeg(data);
  }
});

const spawn = require('child_process').spawn;
var ffmpeg;
function start_ffmpeg(data) {
  if (ffmpeg)
    stop_ffmpeg(ffmpeg)
  video_width = settings_obj.video_width;
  video_height = settings_obj.video_height;
  if (data.command == "start_webcam") {
    var command =  [
                   '-loglevel', 'panic',
                   '-r', '2',
                   '-strict', '-1',
                   '-s', video_width+"x"+video_height,
                   '-f', 'video4linux2',
                   '-i', '/dev/video10',
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-b:v', '600k',
                   '-r', '2',
                   '-strict', '-1',
                   "http://"+server_ip+":8082/"+token+"/"
                 ];
  }
  if (data.command == "play_file") {
    if (ffmpeg)
      stop_ffmpeg(ffmpeg);
    var command =  [
                   '-loglevel', 'panic',
                   '-r', '24',
                   '-strict', '-1',
                   '-i', data.file,
                   '-f', 'mpegts',
		   '-codec:v', 'mpeg1video',
                   '-r', '24',
                   '-strict', '-1',
                   "http://"+server_ip+":8082/"+token+"/"
                 ];
   }
  ffmpeg = spawn('ffmpeg', command);
  ffmpeg.stdout.on('data', (data) => {console.log(`stdout: ${data}`)});
  ffmpeg.stderr.on('data', (data) => {console.log(`stderr: ${data}`)});
  ffmpeg.on('close', (code) => {
    //stop_ffmpeg(ffmpeg);
    console.log(`child process exited with code ${code}`);
  });
  
  clearTimeout(ffmpeg_timer);
  setTimeout(function () {
    stop_ffmpeg(ffmpeg);
  }, 5*60*1000);
  
  ffmpeg_started = true;
  io_relay.emit('ffmpeg started',settings_obj);
  console.log('ffmpeg started | ',command);
}

function stop_ffmpeg(ffmpeg) {
    ffmpeg.kill();
    ffmpeg_started = false;
    console.log('ffmpeg stop');
}

io_relay.on('command', function (data) {
  var command = data.command;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      io_relay.emit('command result',data);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   io_relay.emit('command result',data);
  });
  console.log('command',command);
});

io_relay.on('motion list', function (data) {
  var command = "ls -lahR --full-time /var/lib/motion/*";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      io_relay.emit('motion list result',data);
      return;
    }
    //console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   io_relay.emit('motion list result',data);
  });
  console.log('motion list',command);
});


io_relay.on('folder list', function (data) {
  var folder = data.folder;
  var command = "ls -lah --full-time "+folder;
  console.log('folder list',command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      io_relay.emit('folder list result',data);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   io_relay.emit('folder list result',data);
  });
});


io_relay.on('update', function (data) {
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

io_relay.on('add thermostat', function (data) {
  console.log("add thermostat",data);
  add_thermostat(data);
});

io_relay.on('get thermostat', function (data) {
  device = data.device;
  get_therm_state(device.local_ip);
  //console.log("get thermostat",data);  
});

io_relay.on('set_thermostat', function (data) {
  set_thermostat(data);
});

io_relay.on('add_zwave_device', function (data) {
    //var secure_device = data.secure_device;
    var secure_device = true;
    if (zwave.hasOwnProperty('beginControllerCommand')) {
      console.log("searching for nodes");
      zwave.beginControllerCommand('AddDevice', secure_device);
    } else {
      console.log("searching for nodes!");
      zwave.addNode(secure_device);
    }
});

io_relay.on('get devices', function (data) {
  get_devices();
  console.log("get devices",data);
});

io_relay.on('rename device', function (data) {
  console.log("!! rename device !!",data);
  store_settings(data);
});


io_relay.on('set settings', function (data) {
  console.log("set settings |  ", data);
  //data = {'device_name':data.device_name,'media_enabled':data.media_enabled,'camera_enabled':data.camera_enabled};
  store_settings(data);
  console.log("set settings |  ", data);
});

io_relay.on('set resolution', function (data) {
  var res = data.resolution.split("x");
  var resolution = {};
  resolution.video_width = res[0];
  resolution.video_height = res[1];
  store_settings(resolution);
  console.log("set resolution | " + resolution.video_width+"x"+resolution.video_height);
});

io_relay.on('set alarm', function (data) {
  settings_obj.mode = data.mode;
  store_settings(settings_obj);
  if (data.mode == "armed") {
    alert = true;
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          zwave.setValue(device_array[i].id, 98, 1, 0, true);
          //zwave.setValue(device_array[i].id, 112, 1, 7, 'Tamper');
        }
      } catch (e) { console.log(e) }
    }
  }
  if (data.mode == "disarmed") {
    alert = false;
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          //zwave.setValue(device_array[i].id, 112, 1, 7, 'Activity');
          zwave.setValue(device_array[i].id, 98, 1, 0, false);
        }
      } catch (e) { console.log(e) }
    }
  }
  if (data.mode == "night") {
    for (var i = 0; i < device_array.length; i++) {
      try {
        if (device_array[i].device_type == "Secure Keypad Door Lock") {
          zwave.setValue(device_array[i].id, 98, 1, 0, true);
          //zwave.setValue(device_array[i].id, 112, 1, 7, 'Tamper');
        }
      } catch (e) { console.log(e) }
    }
  }
  console.log("set alarm",data.mode);
});


io_relay.on('get settings', function (data) {
  //console.log("get_settings |  ", data);
  //store_settings({'device_name':data.device_name,'device_type':data.device_type});
  get_settings();
});

io_relay.on('room_sensor', function (data) {
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

io_relay.on('motion_sensor', function (data) {
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

io_relay.on('set zwave', function (data) {
  console.log("set zwave",data);
  try {
    //zwave.setValue(data.node_id, 98, 1, 0, data.value);
    //zwave.setValue(data.node_id, 112, 1, 7, 'Activity');
    zwave.setValue(data.node_id, data.class_id, data.instance, data.index, data.value);
  } catch (e) { console.log(e) }
});

io_relay.on('set lights', function (data) {
  data.light = omit(data.light,"$$hashKey"); //bad angularjs array
  set_light(data.light.id,data.light.state);
  //console.log('lights',data);
});

io_relay.on('link lights', function (data) {
  find_hue_bridge();
  console.log("link lights");
});


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

  io_relay.on('window_sensor', function (data) {
    var _mac = data.mac;
    var _magnitude = data.magnitude;
    console.log( _mac + " | window_sensor data " + _magnitude);
  });

/*io_relay.on('png_test', function (data) {
  ping_time = Date.now() - ping_time;
  console.log("replied in " + ping_time + "ms");
});*/

io_relay.on('media', function (data) {
  var command = data.cmd;
  if ( platform === "win32" ) {
    if (command == "volume down"){
      spawn('nircmd.exe', ['mutesysvolume', '0']);        
      spawn('nircmd.exe', ['changesysvolume', '-5000']);
    }
    if (command == "volume up"){  
      spawn('nircmd.exe', ['mutesysvolume', '0']);
      spawn('nircmd.exe', ['changesysvolume', '+5000']);
    }
    if (command == "mute"){ spawn('nircmd.exe', ['mutesysvolume', '1']) }
    if (command == "play"){ spawn('nircmd.exe', ['mutesysvolume', '1']) }
  } else
  if ( platform === "linux" ) {  
    if ( command === "volume down" ) { spawn('xdotool', ['key', 'XF86AudioLowerVolume']) }
    if ( command === "volume up" ) { spawn('xdotool', ['key', 'XF86AudioRaiseVolume']) }
    if ( command === "mute" ) { spawn('xdotool', ['key', 'XF86AudioMute']) }
    if ( command === "play" ) { spawn('xdotool', ['key', 'XF86AudioPlay']) }
    if ( command === "next" ) { spawn('xdotool', ['key', 'XF86AudioNext']) }  
    //for volume slider use: xodotool amixer -c 0 sset Master,0 80%
  } else {
    console.log("platform not supported " + platform);
  }

  console.log("media | " + command);
});

io_relay.on('gateway', function (data) {
  console.log(mac + " | " + data.command);
});

io_relay.on('disconnect', function() {
  console.log("disconnected, setting got_token false");
  got_token = false;
});
}
// -------------------------------------------------------- //

var ping_time = Date.now();
function send_ping(){
  ping_time = Date.now();
  console.log('sending ping...');
  io_relay.emit('png_test');
}

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
      data_obj['token'] = token;
      data_obj['mac'] = mac;
      data_obj['device_type'] = 'thermostat';
      data_obj['local_ip'] = data.local_ip;
      data_obj['device_name'] = data.device_name;
      data_obj['schedule'] = {"7 AM":70,"9 AM":70,"11 AM":70,"1 PM":70,"3 PM":70,"5 PM":70,"7 PM":70,"9 PM":70,"11 PM":70,"1 AM":70};
      //var device_obj = {device_type:"thermostat", device_name:data_obj.device_name, local_ip:data_obj.local_ip, schedule:data_obj.schedule};
      store_device(data_obj);
      device_array.push(data_obj);
      io_relay.emit('thermostat_state',data_obj);
    }
    if (error !== null) {
     console.log('error ---> ' + error);
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
            store_device(device_array[i]);
            //console.log("get_therm_state",data_obj);
	  }
	}
      }
      if (error !== null) {
       console.log('error ---> ' + error);
      }      
    }
  });
}

function send_command(command) {
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
}

function find_index(array, key, value) {
  for (var i=0; i < array.length; i++) {
    if (array[i][key] == value) {
      return i;
    }
  }
  return -1;
}

function isJSON (json_obj) {
  if (/^[\],:{}\s]*$/.test(json_obj.replace(/\\["\\\/bfnrtu]/g, '@').
  replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
  replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
    return true;
  }else{
    return false;
  }  
}
