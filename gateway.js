var fs = require('fs');
var os = require('os');
var express = require('express');
var app = express();
var program_app = express();
var querystring = require('querystring');
var http = require('http');
var server = http.createServer(app);
var io_relay = require('socket.io-client')('http://68.12.126.213:5000');
var port = process.env.PORT || 3030;
var php = require("node-php");
var request = require('request');
var spawn = require('child_process').spawn;
var mysql      = require('mysql');
var EventEmitter = require("events").EventEmitter;
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
var username = "init";
var device_name = "init";
var ip = "init";
var device_port = "init";
var count = 0;
var text_timeout = 0
var platform = process.platform;
var hue = require("node-hue-api");
var info_obj = JSON.parse(fs.readFileSync('/home/pi/open-automation/info.json', 'utf8'));
const exec = require('child_process').exec;

// -------------------------------  MangoDB  --------------------------------- //
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://127.0.0.1:27017/settings';

var ping = require ("net-ping");
var session = ping.createSession ();
var target = "8.8.8.8";
session.pingHost (target, function (error, target) {
  if (error) {
    console.log (target + ": " + error.toString ());
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', url);
        var collection = db.collection('connection_info');
        var cursor = collection.find({"_id":ObjectId("576d5f15cf0dda52c3818d1d")});
        cursor.each(function (err, doc) {
          if (err) {console.log(err)} 
          else {
  	    try {
              console.log('NO REPLY: isAP', doc.isAP);
  	      if (doc.isAP == false) {
                console.log("Starting AP mode...");

    var interfaces_file = "allow-hotplug wlan0\n"
                   + "iface wlan0 inet static\n"
    		   + "address 172.24.1.1\n"
    		   + "netmask 255.255.255.0\n"
    		   + "network 172.24.1.0\n"
    		   + "broadcast 172.24.1.255\n";
    fs.writeFile("/etc/network/interfaces", interfaces_file, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("Interface file saved");
    });

    var dhcpcd_file = "#denyinterfaces wlan0\n"
                    +  "hostname\n"
                    +  "clientid\n"
                    +  "persistent\n"
                    +  "option rapid_commit\n"
                    +  "option domain_name_servers, domain_name, domain_search, host_name\n"
                    +  "option classless_static_routes\n"
                    +  "option ntp_servers\n"
                    +  "require dhcp_server_identifier\n"
                    +  "slaac private\n"
                    +  "nohook lookup-hostname\n";
    fs.writeFile("/etc/dhcpcd.conf", dhcpcd_file, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("dhcpcd saved!");
    });

    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', url);
        var collection = db.collection('connection_info');
        var connection_info = {"_id" : ObjectId("576d5f15cf0dda52c3818d1d"), isAP:true};
        collection.save(connection_info, function (err, result) {
          if (err) {console.log(err)} else {
            console.log('web GUI: set isAP true', result.length, result);
    exec("sudo ifdown wlan0 && sudo ifup wlan0");
    exec("sudo reboot");
          }
        });
      }
    });

	      }
	    }
	    catch (e){console.log("isAP null")}
          }
        });
      }
    });
  }
  else console.log (target + ": Alive");
});

// ----------------------------  program interface  ----------------------------- //
var program_server = http.createServer(program_app);
var program_io = require('socket.io')(program_server);
var program_port = 3000;
program_server.listen(program_port, function () {
  console.log('Access GUI on port %d', program_port);
});     

var router_array = [];
var router_list = [];
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
  console.log("router_array | " + router_list);
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
		    	+ "    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf\n"
		    	+ "allow-hotplug wlan1\n"
		    	+ "iface wlan1 inet manual\n"
		    	+ "    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf\n";
    fs.writeFile("/etc/network/interfaces", interfaces_file, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("Interfaces saved!");
    });

    var dhcpcd_file = "#denyinterfaces wlan0\n"
                    +  "hostname\n"
                    +  "clientid\n"
                    +  "persistent\n"
                    +  "option rapid_commit\n"
                    +  "option domain_name_servers, domain_name, domain_search, host_name\n"
                    +  "option classless_static_routes\n"
                    +  "option ntp_servers\n"
                    +  "require dhcp_server_identifier\n"
                    +  "slaac private\n"
                    +  "nohook lookup-hostname\n";
    fs.writeFile("/etc/dhcpcd.conf", dhcpcd_file, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("dhcpcd saved!");
    });

    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', url);
        var collection = db.collection('connection_info');
        var connection_info = {"_id" : ObjectId("576d5f15cf0dda52c3818d1d"), isAP:false};
        collection.save(connection_info, function (err, result) {
          if (err) {console.log(err)} else {
            console.log('web GUI: set isAP false', result.length, result);
  	    exec("sudo ifdown wlan0; sudo ifup wlan0");
      	    //exec("sudo reboot");
          }
        });
      }
    });

  });
});

// -------------------------  zwave  ---------------------- //
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
var nodes = [];

zwave.on('connected', function(homeid) {
	console.log('=================== CONNECTED! ====================');
});

zwave.on('driver ready', function(homeid) {
	console.log('=================== DRIVER READY! ====================');
	//console.log('scanning homeid=0x%s...', homeid.toString(16));
//console.log("adding node");
//zwave.addNode(1);
});

zwave.on('driver failed', function() {
	console.log('failed to start driver');
	zwave.disconnect();
	//process.exit();
});

zwave.on('node added', function(nodeid) {
	console.log('=================== NODE ADDED! ====================');
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
      //console.log("nodeid: " + nodeid + " value: " + JSON.stringify(value) + " comclass: " + comclass);

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
    console.log("set_gateway_devices | " + node_data.mac + ":" + node_data.token);
    io_relay.emit('set_gateway_devices', node_data);
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
// ----------------------  check disk space  ------------------- //
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
    console.log("free space: " + free);
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
// ----------------------  find bridges  ------------------- //
var bridge_obj = {};
var displayBridges = function(bridge) {
    bridge_obj = bridge[0];
    //info_obj['ip'] = bridge_obj.ipaddress;
    fs.writeFile( "info.json", JSON.stringify(info_obj), "utf8" );
    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};
//hue.nupnpSearch().then(displayBridges).done();

// ----------------------  link bridge  ------------------- //

function link_hue_bridge(ipaddress) {

var HueApi = require("node-hue-api").HueApi;

console.log(ipaddress);
var hostname = ipaddress,
    userDescription = "Node Gateway";

var displayUserResult = function(result) {
    info_obj['ip'] = ipaddress;
    info_obj['user'] = result;
    info_obj['token'] = token;
    fs.writeFile( "info.json", JSON.stringify(info_obj), "utf8" );
    console.log("Created user: " + JSON.stringify(result));
};

var displayError = function(err) {
    console.log(err);
};

var hue = new HueApi();

// Using a promise
hue.registerUser(hostname, userDescription)
    .then(displayUserResult)
    .fail(displayError)
    .done();

}

// ----------------------  finding lights  ------------------- //
var HueApi = require("node-hue-api").HueApi;

var displayResult = function(result) {
    info_obj['lights'] = result.lights;
    fs.writeFile( "info.json", JSON.stringify(info_obj), "utf8" );    
    //io_relay.emit('device_info',info_obj);
};

var host = info_obj.ip,
    username = info_obj.user,
    api;

api = new HueApi(host, username);

// Using a callback
api.lights(function(err, lights) {
    if (err) console.log(err);
    displayResult(lights);
});

// ----------------------  get device info  ------------------- //
var local_ip = "init";
var ifaces = os.networkInterfaces();
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
  });
});

var mac = "init";
var device_type = "gateway";
var device_name = "Gateway";
require('getmac').getMac(function(err,macAddress){
  if (err)  throw err
  mac = macAddress.replace(/:/g,'').replace(/-/g,'').toLowerCase();
  console.log("Enter device ID (" + mac + ") at http://pyfi.org");
  io_relay.emit('get_token',{ mac:mac, local_ip:local_ip, port:camera_port, device_type:device_type });
});

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
//var camera_port = 3031;
var httpProxy = require('http-proxy');
//var camera_proxy = httpProxy.createProxyServer();
var proxy = httpProxy.createProxyServer();
http.createServer(function(req, res) {
  session_id = "/session/" + token;
  //cloud_id = "/cloud/" + token;
  
  console.log("received: " + req.url.substring(1,129) + " | checking with: " + session_id);
  if (req.url.substring(1,129) === token || req.url.substring(0,3) === "/js") {
    //req['url'] = '';
    proxy.web(req, res, { target:'http://localhost:9090' });
    console.log("cloud proxied");
  } else
  if (req.url === session_id) {
    //req['url'] = '';  
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

io_relay.on('token', function (data) {
  token = data.token;
  session_string = '/' + token;
  app.use(mount(session_string, IndexRouter));
  info_obj['token'] = token;
  info_obj['mac'] = mac;
  fs.writeFile( "info.json", JSON.stringify(info_obj), "utf8" );  
  //fs.writeFile( "session.dat", data.token, "utf8", callback );  
  function callback(){
    //console.log('callback for session.dat');
  }  
  console.log("token set " + token);
});

io_relay.on('get_thermostat', function (data) {
  var cmd = data.cmd;
  therm_ip = data.ip;
  get_therm_state(data.ip,cmd);
  console.log("thermostat |  " + cmd);  
});

io_relay.on('set_thermostat', function (data) {
  set_thermostat(data.state.new_state);
  console.log("set_thermostat |  " + JSON.stringify(data));  
});

io_relay.on('add_zwave_device', function (data) {
  console.log("adding node");
  zwave.addNode(1);
});

node_data = {};
io_relay.on('get_gateway_devices', function (data) {
  node_data['token'] = token;
  node_data['mac'] = mac;
  node_data['nodes'] = nodes;
  console.log("mac: " + node_data.mac + " token: " + node_data.token);
  io_relay.emit('set_gateway_devices', node_data);
  console.log("get_gateway_devices |  " + JSON.stringify(node_data));  
});



io_relay.on('cmd_gateway_device', function (data) {
  console.log("cmd_gateway_device |  " + JSON.stringify(data));
  //zwave.setValue(data.node_id, data.class_id, data.instance, data.index, data.value);
  zwave.setValue(4, 98, 1, 0, data.value);
});


io_relay.on('lights', function (light) {
  set_light(light.id,light.state);
});

io_relay.on('link_lights', function (data) {
  io_relay.emit('device_info',info_obj);
  console.log("emitting light info");  
});

io_relay.on('light_theme', function (data) {
  api.lights(function(err, lights) {
    if (err) console.log(err);
    displayResult(lights);
  });
  if (data.theme === 'presence') {
    for (i = 0; i < info_obj.lights.length; i++) {
      var state = {"on":true,"bri":"100"}
      if (info_obj.lights[i].state.on == false) {
        set_light(info_obj.lights[i].id,state);
        console.log('setting ' + info_obj.lights[i].id );
      }
    }
  }
  if (data.theme === 'alert') {
    for (i = 0; i < info_obj.lights.length; i++) {
      var state = {"on":true,"rgb":[255,0,0],"bri":"255"}
      console.log(info_obj.lights[i].id);
      set_light(info_obj.lights[i].id,state);      
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

// --------------------  setting light state  ----------------- //

function set_light(light_id,state) {

var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var displayResult = function(result) {
    //console.log("result | " + JSON.stringify(result));
};

var host = info_obj.ip,
    username = info_obj.user,
    api = new HueApi(host, username);

api.setLightState(light_id, state, function(err, lights) {
    if (err) console.log(err);
    displayResult(lights);
});

console.log(light_id + " | setting state: " + JSON.stringify(state));
}

// -------------------------------------------------------- //

var ping_time = Date.now();
function ping(){
  ping_time = Date.now();
  console.log('sending ping...');
  io_relay.emit('png_test');
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

function get_therm_state( ipaddress, cmd ) {
request.get(
'http://'+ipaddress+'/tstat',
function (error, response, data) {
  if (!error && response.statusCode == 200) {
        console.log('thermostat says: ' + data);
    if (isJSON(data)) { 
      var data_obj = {};    
      data_obj['current_state'] = JSON.parse(data);
      data_obj['token'] = token;
      data_obj['mac'] = mac;
      data_obj['ip'] = ipaddress;
      data_obj['cmd'] = cmd;
      if (cmd === "link") {
          io_relay.emit('link_thermostat',data_obj);
        }
        if (cmd === "update") {
          io_relay.emit('thermostat_state',data_obj);
        }      
      }
      if (error !== null) {
        console.log('error ---> ' + error);
      }      
    }
  });
}

function send_command(command){
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
