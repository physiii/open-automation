var fs = require('fs');
var os = require('os');
var express = require('express');
var app = express();
var program_app = express();
var querystring = require('querystring');
var http = require('http');
var server = require('http').createServer(app);
var program_server = require('http').createServer(program_app);
var program_io = require('socket.io')(program_server);
var io = require('socket.io')(server);
var io_upstairs = require('socket.io-client')('http://192.168.0.9:3000');
var io_downstairs = require('socket.io-client')('http://192.168.0.3:3000');
var io_relay = require('socket.io-client')('wss://peaceful-coast-12080.herokuapp.com');
var io_relay = require('socket.io-client')('http://68.12.126.213:5000');
var port = process.env.PORT || 3030;
//var program_port = process.env.PORT || 3000;
var php = require("node-php");
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var mysql      = require('mysql');
var EventEmitter = require("events").EventEmitter;
var body = new EventEmitter();
var gb_event = new EventEmitter();
const gb_read = require('child_process').exec;
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
var info_obj = JSON.parse(fs.readFileSync('info.json', 'utf8'));
// ----------------------  find bridges  ------------------- //
var bridge_obj = {};
var displayBridges = function(bridge) {
    bridge_obj = bridge[0];
    //info_obj['ip'] = bridge_obj.ipaddress;
    fs.writeFile( "info.json", JSON.stringify(info_obj), "utf8" );
    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};
hue.nupnpSearch().then(displayBridges).done();

// ----------------------  link bridge  ------------------- //
//link_hue_bridge(info_obj.ip);
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
  console.log("Enter device ID (" + mac + ") at http://dev.pyfi.org");
  io_relay.emit('get_token',{ local_ip:local_ip, mac:mac, local_ip:local_ip, port:camera_port, device_type:device_type });
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

// --------------  websocket server for devices  ----------------- //
var ws_port = 4040;
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: ws_port });
//console.log('websockets on port %d', ws_port);
wss.on('connection', function connection(ws) {
  try {
    ws.send('Hello from server!');  
  }
  catch (e) { 
    console.log("error: " + e)
  }
  ws.on('message', function incoming(message) {
    console.log(message);
  });
  ws.on('error', function() {
    console.log('error catch!');
  });
});

// ------------------  relayed socket.io messages  ------------------- //
//var io_relay = require('socket.io-client')('wss://pyfi-relay.herokuapp.com');


//
//if disconnected from relay, loop reconnect attemp !!!!!
//

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

io_relay.on('lights', function (light) {

  set_light(light.id,light.state);
//var state = {"rgb":light.state.rgb};
/*for (var i=0; i < info_obj.lights.length; i++) {
  console.log("info_obj.lights | " + info_obj.lights[i].id);
  set_light(info_obj.lights[i].id,state);
}*/
//console.log(light.id + " | " + light.state.rgb);
  /*
  var state = [];
  //state['on'] = !light.selected;
  state['rgb'] = [200, 200, 200];
  if (light.state.hue) {
    //state['hue'] = "1000";
    //console.log("hue state " + light.state.hue);
  }*/
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
  
io_relay.emit('png_test');

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
      //console.log("data_obj is " + JSON.stringify(data_obj));
      if (cmd === "link") {
          io_relay.emit('link_thermostat',data_obj);
        }
        if (cmd === "update") {
          //console.log("have current_state?? --> " + )
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

// ----------------------------  web interface  ----------------------------- //
/*
var program_port = 3000;
program_server.listen(program_port, function () {
  console.log('Access GUI on port %d', program_port);
});     
      
program_app.use(express.static(__dirname + '/public'), php.cgi("/"));
program_io.on('connection', function (socket) {
  socket.on('get_token', function (data) {
    user = data['user'];
    password = data['pwd'];
    post_data = {user:user, pwd:password, mac:mac};
    var response = request.post(
      'http://68.12.157.176:8080/pyfi.org/php/set_token.php',
      {form: post_data},
      function (error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('set_token.php says: ' + data.token);
          //io_relay.emit('token',{token:"blah"});
          fs.writeFile( "device_info.json", data.token, "utf8", callback );
          function callback(){
            console.log('callback for device_info.json');
          }
          //body.data = data;          
          //body.emit('update');
        }
      });
    console.log( "token received for " + data['user']);
  });
});
*/
