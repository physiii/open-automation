// -------------------  author: Andy Payne andy@pyfi.org ----------------------- //
// -----------------  https://plus.google.com/+AndyPayne42  -------------------- //

var fs = require('fs');
var os = require('os');
var express = require('express');
var app = express();
var program_app = express();
var querystring = require('querystring');
var io_relay = require('socket.io-client')('http://68.12.126.213:5000');
var port = process.env.PORT || 3030;
var php = require("node-php");
var request = require('request');
var spawn = require('child_process').spawn;
var mysql      = require('mysql');
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
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'device'
});
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
var zwave_disabled = true;

// -------------------------------  MangoDB  --------------------------------- //
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;

//-- initialize variables --//
get_devices();
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
	//console.log('initialize variables | ',settings_obj);	
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
      db.close();
    });
  }
});

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
	  console.log('settings_obj',settings_obj);
	  io_relay.emit('load settings',settings_obj);
	  if (settings_obj.gateway_enabled && zwave_disabled) {
	    init_zwave();
	    zwave_disabled = false;
  	  }
	  if (got_token == false) {
	    io_relay.emit('get_token',{ mac:mac, local_ip:local_ip, port:camera_port, device_type:device_type });
  	  }
  	//console.log('load_settings | ',settings_obj);	
        } else {
	  console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
}

//-- store new settings --//
function set_settings(data) {console.log('set_settings',data);
  MongoClient.connect('mongodb://127.0.0.1:27017/settings', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('settings');
      collection.find().toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {
  	  collection.update({}, {$set:data}, function(err, item){
	  console.log("item: ",item);
          });
        } else {
          console.log('No document(s) found with defined "find" criteria!');
          collection.insert(data, function (err, result) {
            if (err) {
              console.log(err);
            } else {
               console.log('Inserted %d', result.length, result);
            }
          });
        }
        db.close();
        get_settings();
      });
    }
  });
}

//-- store new device --//
function store_device(device) {
  delete device["_id"];
  MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('devices');
      console.log('store_device',device);
      collection.update({id:device.id}, {$set:device}, {upsert:true}, function(err, item){
        console.log("update device: ",item)});
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
	  console.log("get_devices");
	  io_relay.emit('load devices',{devices:device_array, mac:mac, token:token});
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
}

main_loop();
function main_loop () {
setTimeout(function () {
  get_settings();
  get_devices();
  check_connection();
  get_public_ip();
  scan_wifi();
  get_therm_state();
  main_loop();
  console.log("main loop");
  for (var i = 0; i < device_array.length; i++) {
    if (device_array[i].device_type == 'thermostat') {
      get_therm_state(device_array[i].local_ip);
    }
  }
}, 60*1000);
}
// ---------------------- device info  ------------------- //
var local_ip = "init";
var ifaces = os.networkInterfaces();
var mac = "init";
var device_type = "gateway";
var device_name = "Gateway";
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
		 + "sudo modprobe bcm2835-v4l2\n"
                 + "export DISPLAY=':0.0'\n"
                 + "su pi -c 'cd ~/open-automation/motion && ./motion -c motion-mmalcam-both.conf >> /var/log/motion 2>&1 &'\n"
                 + "su pi -c 'cd ~/open-automation && sudo node gateway -p "+port+" >> /var/log/gateway 2>&1 &'\n"
                 + "exit 0;\n"
    fs.writeFile("/etc/rc.local", rc_local, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("rc.local saved!");
    });
    settings_obj.local_ip = local_ip;
  });
});
}

function get_mac () {
require('getmac').getMac(function(err,macAddress){
  if (err)  throw err
  mac = macAddress.replace(/:/g,'').replace(/-/g,'').toLowerCase();
  settings_obj.mac = mac;
  set_settings(settings_obj);
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
      console.log("hostapd_file saved!");
      //spawn('hostapd', ['-d', '/etc/hostapd/hostapd.conf']);
    });
});
}

function get_public_ip() {
  request.get(
  'http://pyfi.org/php/get_ip.php',
  function (error, response, data) {
    if (!error && response.statusCode == 200) {
      console.log('public_ip ',data);
      public_ip = data;
      settings_obj.public_ip = public_ip;
      set_settings({"public_ip":public_ip});
      if (error !== null) {
       console.log('error ---> ' + error);
      }      
    }
  });
}

// -------------------------------  connection  -------------------------------- //
var router_array = [];
var router_list = [];
scan_wifi();

function check_connection() {
  var ping = require ("ping");
  host = "8.8.8.8";
  ping.sys.probe(host, function(isAlive){
    var msg = isAlive ? 'alive' : 'dead';
    if (msg == 'dead') {
      var interfaces_file = "allow-hotplug wlan0\n"
                   + "iface wlan0 inet static\n"
    		   + "address 172.24.1.1\n"
    		   + "netmask 255.255.255.0\n"
    		   + "network 172.24.1.0\n"
    		   + "broadcast 172.24.1.255\n";
      fs.writeFile("/etc/network/interfaces", interfaces_file, function(err) {
        if(err) return console.log(err);
        console.log("Interface file saved, starting AP");
        exec("sudo ifdown wlan0 && sudo ifup wlan0;sleep 5;sudo hostapd -d /etc/hostapd/hostapd.conf", (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log("stdout: " + stdout);
          console.log("stderr: " + stderr);
        });
      });
    }
    console.log(msg);
  });
}

function scan_wifi() {
ap_mode = true;
if (ap_mode == true) {
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
    set_settings(settings_obj);
    //console.log("router_array | " + settings_obj.router_list);
  });
}
}
// ----------------------------  program interface  ----------------------------- //
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
  socket.on('set_wifi', function (data) {
    router_name = data['router_name'];
    router_password = data['router_password'];
    console.log(router_name + ":" + router_password);
    var wpa_supplicant = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n"
                       + "update_config=1\n"
		       + "country=GB\n"
                       + "network={\n"
		       + "ssid=\""+router_name+"\"\n"
		       + "psk=\""+router_password+"\"\n"
		       + "key_mgmt=WPA-PSK\n"
		       + "}\n";
    fs.writeFile("/etc/wpa_supplicant/wpa_supplicant.conf", wpa_supplicant, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("wpa_supplicant saved!");
    });
    var interfaces_file = "source-directory /etc/network/interfaces.d\n"
			+ "auto lo\n"
			+ "iface lo inet loopback\n"
			+ "iface eth0 inet manual\n"
			+ "allow-hotplug wlan0\n"
			+ "iface wlan0 inet manual\n"
		    	+ "    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf\n";

    fs.writeFile("/etc/network/interfaces", interfaces_file, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("Interfaces saved!");
    //exec("sudo ifdown wlan0 && sudo ifup wlan0;");
    exec("sudo reboot");
    function timeout() {
      setTimeout(function () {
        console.log("checking connection...");
        check_connection();
      }, 2*60*60*1000);
    }timeout();
    });
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
	zwave.disconnect();
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
    console.log("VALUE ADDED: nodeid: " + nodeid + " value: " + JSON.stringify(value) + " comclass: " + comclass);

    if (value.value_id == "4-98-1-0"){
      //zwave.setValue(4, 98, 1, 0, true);
    }
});

zwave.on('value changed', function(nodeid, comclass, value) {
  if (nodes[nodeid]['ready']) {
    console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
      value['label'],
      nodes[nodeid]['classes'][comclass][value.index]['value'],
      value['value']);
    node_data['token'] = token;
    node_data['mac'] = mac;
    node_data['nodes'] = nodes;
    console.log("!!!!!!???send devices | " + node_data.mac + ":" + node_data.token);
    //io_relay.emit('send devices', node_data);
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
	console.log('scan complete, hit ^C to finish.');
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
    set_settings({free_space:free,total_space:total})
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
        //console.log("storing lights",device_array[i]);
      }
   }
  });
}

// --------------------  setting light state  ----------------- //
function set_light(device_id,light) {
  //console.log("set_light",light);
  if (light.state.on == false)
   light.state = {on:false};
  for (var i = 0; i < device_array.length; i++) {
    if (device_array[i].device_type == "lights") {
      hue = new HueApi(device_array[i].ipaddress,device_array[i].user);
      hue.setLightState(light.id, light.state, function(err, results) {
        if (err) console.log(err);
        for (var i = 0; i < device_array.length; i++) {
          if (device_array[i].device_type == "lights") {
            find_lights(device_array[i]);
	  }
	}
      });
    }
  }
}
// ----------------------  file server  ------------------- //
var koa =require('koa');
var path = require('path');
var tracer = require('tracer');
var mount = require('koa-mount');
var morgan = require('koa-morgan');
var koaStatic = require('koa-static');

// Config
var argv = require('optimist')
  .usage([
    'USAGE: $0 [-p <port>] [-d <directory>]']
  )
  .option('camera_port', {
    alias: 'p',
    'default': 3031,
    description: 'Server Port'
  })
  .option('directory', {
    alias: 'd',
    'default':'./files',
    description: 'Root Files Directory'
  })
  .option('version', {
    alias: 'v',
    description: 'Server　Version'
  })
  .option('help', {
    alias: 'h',
    description: "Display This Help Message"
  })
  .argv;

if (argv.help) {
  require('optimist').showHelp(console.log);
  process.exit(0);
}

if (argv.version) {
  console.log('FileManager', require('./package.json').version);
  process.exit(0);
}

global.C = {
  data: {
    root: argv.directory || path.dirname('.')
  },
  logger: require('tracer').console({level: 'info'}),
  morganFormat: ':date[iso] :remote-addr :method :url :status :res[content-length] :response-time ms'
};

// Start Server
var Tools = require('./tools');

var app = koa();
app.proxy = true;
app.use(Tools.handelError);
app.use(Tools.realIp);
app.use(morgan.middleware(C.morganFormat));

var IndexRouter = require('./routes');

app.use(koaStatic('./public/'));

var startServer = function (app, port) {
  app.listen(port);
  //C.logger.info('listening on *.' + port);
};

startServer(app, + 9090);

//---------------------- proxy servers -------------------//
var camera_port = argv.camera_port;
var httpProxy = require('http-proxy');
var http = require('http');
var proxy = httpProxy.createProxyServer();
http.createServer(function(req, res) {
  session_id = "/session/" + token; 
  console.log("received: " + req.url.substring(1,129) + " | checking with: " + session_id);
  if (req.url.substring(1,129) === token || req.url.substring(0,3) === "/js") {
    proxy.web(req, res, { target:'http://localhost:9090' });
    console.log("cloud proxied");
  } else
  if (req.url === session_id) {
    proxy.web(req, res, { target:'http://localhost:8081', prependPath: false });
    console.log("camera proxied");
  } else {
    console.log("denied");
  }
}).listen(camera_port, function () {
  console.log('To use camera and file server, forward port '+camera_port+' to '+local_ip+' in your routers settings');
});
proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});

//---------------------- socket.io -------------------//
var got_token = false;
io_relay.on('token', function (data) {
  token = data.token;
  session_string = '/' + token;
  app.use(mount(session_string, IndexRouter));
  settings_obj.token = token;
  settings_obj.mac = mac;
  set_settings({"token":token});
  get_settings();
  got_token = true;
  console.log("token set " + token);
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

io_relay.on('add thermostat', function (data) {
  add_thermostat(data);
  console.log("add_thermostat |  " + JSON.stringify(data));  
});

io_relay.on('get thermostat', function (data) {
  device = data.device;
  get_therm_state(device.local_ip);
  console.log("get thermostat",data);  
});

io_relay.on('set_thermostat', function (data) {
  set_thermostat(data.state.new_state);
  console.log("set_thermostat |  " + JSON.stringify(data));  
});

io_relay.on('add_zwave_device', function (data) {
  console.log("adding node");
    if (zwave.hasOwnProperty('beginControllerCommand')) {
      zwave.beginControllerCommand('AddDevice', true);
    } else {
      zwave.addNode(false);
    }
});

node_data = {};
io_relay.on('get devices', function (data) {
  get_devices();
  console.log("get devices",data);
});


io_relay.on('set settings', function (data) {
  console.log("set settings |  ", data);
  //data = {'device_name':data.device_name,'media_enabled':data.media_enabled,'camera_enabled':data.camera_enabled};
  set_settings(data);
  console.log("set settings |  ", data);
});

io_relay.on('get settings', function (data) {
  set_settings({'device_name':data.device_name,'device_type':data.device_type});
  get_settings();
  //console.log("get_settings |  ", data);
});

io_relay.on('cmd_gateway_device', function (data) {
  console.log("cmd_gateway_device |  " + JSON.stringify(data));
  //zwave.setValue(data.node_id, data.class_id, data.instance, data.index, data.value);
  zwave.setValue(4, 98, 1, 0, data.value);
});

io_relay.on('lights', function (data) {
  data.light = omit(data.light,"$$hashKey"); //bad angularjs array
  var light = data.light;
  var device = data.device;
  set_light(device.id,light);
});

io_relay.on('link lights', function (data) {
  //io_relay.emit('device_info',settings_obj.hue.hue);
  find_hue_bridge();
  console.log("link lights");
});

io_relay.on('light_theme', function (data) {
  api.lights(function(err, lights) {
    if (err) console.log(err);
    displayResult(lights);
  });
  if (data.theme === 'presence') {
    for (i = 0; i < settings_obj.hue.hue.lights.length; i++) {
      if (settings_obj.hue.hue.lights[i].state.on == false) {
        settings_obj.hue.lights[i].state = {"on":true,"bri":"100"};
        set_light(settings_obj.hue.lights[i]);
        console.log('presence',settings_obj.hue.lights[i]);
      }
    }
  }
  if (data.theme === 'alert') {
    for (i = 0; i < settings_obj.hue.hue.lights.length; i++) {
      settings_obj.hue.hue.lights[i].state = {"on":true,"rgb":[255,0,0],"bri":"255"}
      set_light(settings_obj.hue.hue.lights[i]);
      console.log(settings_obj.hue.hue.lights[i]);
    }
  }
  console.log("setting theme | " + data.theme);  
});

  io_relay.on('window_sensor', function (data) {
    var _mac = data.mac;
    var _magnitude = data.magnitude;
    console.log( _mac + " | window_sensor data " + _magnitude);
  });

io_relay.on('png_test', function (data) {
  ping_time = Date.now() - ping_time;
  console.log("replied in " + ping_time + "ms");
});

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

// -------------------------------------------------------- //

var ping_time = Date.now();
function ping(){
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
/*
MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established');
    var collection = db.collection('devices');
    collection.find(device_obj).toArray(function (err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        console.log('Found:', result);
      } else {
        console.log('Inserting device');
        collection.insert(device_obj, function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log('Inserted %d', result.length, result);
	    var collection = db.collection('schedules');
	    var blank_schedule = {local_ip:data.local_ip, device_type:"thermostat", "7 AM":70,"9 AM":70,"11 AM":70,"1 PM":70,"3 PM":70,"5 PM":70,"7 PM":70,"9 PM":70,"11 PM":70,"1 AM":70};
            collection.insert(blank_schedule, function (err, result) {
              if (err) {
                console.log(err);
              } else {
                console.log('Inserted schedule %d', result.length, result);
              }
            });
          }
        });
      }
    });
  }
});
*/

      io_relay.emit('thermostat_state',data_obj);
    }
    if (error !== null) {
     console.log('error ---> ' + error);
    }
  }
});

}

function set_thermostat(state) {
  console.log(state);
  var request = require('request');
  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url:     'http://'+therm_ip+'/tstat',
    body:    JSON.stringify(state)
  }, function(error, response, body){
    console.log('set_thermostat: ' + body);
    get_therm_state(therm_ip,"update");
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
            console.log("get_therm_state",data_obj);
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

function isJSON (json_obj) {
  if (/^[\],:{}\s]*$/.test(json_obj.replace(/\\["\\\/bfnrtu]/g, '@').
  replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
  replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
    return true;
  }else{
    return false;
  }  
}
