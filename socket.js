	// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- socket.js -------------------------------------- //

var database = require('./database.js');
var utils = require('./utils.js');
var crypto = require('crypto');
var http = require('http');
var url = require('url');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = {
  start: start
}
var start_time = Date.now();

var DEVICE_PORT = config.device_port || 4000;
//var BUTTONS_PORT = config.buttons_port || 4001;
var find_index = utils.find_index; 
var TAG = "[socket.js]";

var transporter = nodemailer.createTransport(
  smtpTransport({
    service: config.mail.service,
    auth: {
      user: config.mail.from_user,
      pass: config.mail.password
    }
  })
);

/* --------------  websocket server for devices  ----------------- */
var WebSocketServer = require('ws').Server
const wssTokens = new WebSocketServer({ noServer: true });
const wssButtons = new WebSocketServer({ noServer: true });
const wssPower = new WebSocketServer({ noServer: true });
const wssLED = new WebSocketServer({ noServer: true });
const wssMicrophone = new WebSocketServer({ noServer: true });
const wssMotion = new WebSocketServer({ noServer: true });
const wssUpdate = new WebSocketServer({ noServer: true });
const wssClimate = new WebSocketServer({ noServer: true });
const server = http.createServer().listen(DEVICE_PORT);

server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/tokens') {
    wssTokens.handleUpgrade(request, socket, head, (ws) => {
      wssTokens.emit('connection', ws);
    });
  } else if (pathname === '/buttons') {
    wssButtons.handleUpgrade(request, socket, head, (ws) => {
      wssButtons.emit('connection', ws);
    });
  } else if (pathname === '/power') {
    wssPower.handleUpgrade(request, socket, head, (ws) => {
      wssPower.emit('connection', ws);
    });
  } else if (pathname === '/LED') {
    wssLED.handleUpgrade(request, socket, head, (ws) => {
      wssLED.emit('connection', ws);
    });
  } else if (pathname === '/microphone') {
    wssMicrophone.handleUpgrade(request, socket, head, (ws) => {
      wssMicrophone.emit('connection', ws);
    });
  } else if (pathname === '/motion') {
    wssMotion.handleUpgrade(request, socket, head, (ws) => {
      wssMotion.emit('connection', ws);
    });
  } else if (pathname === '/climate') {
    wssClimate.handleUpgrade(request, socket, head, (ws) => {
      wssClimate.emit('connection', ws);
    });
  } else if (pathname === '/update') {
    wssUpdate.handleUpgrade(request, socket, head, (ws) => {
      wssUpdate.emit('connection', ws);
    });
  } else {
    socket.destroy();
  }
});

wssUpdate.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming update connection ---- >>");
  ws.on('message', function incoming(message) {
    console.log("<< ---- incoming update message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var value = msg.value;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    //if (device_index < 0)
    if (!type) return;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    // --------------  respond to token requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsUpdate = ws;
      try { ws.send("linked") }
      catch (e) { console.log("reply error | " + e) };
      console.log('updated update socket',device_objects[device_index].mac);
    }

    // --------------  send buttons to clients --------------- //    
    if (cmd == "update") {
      try { ws.send("sending update") }
      catch (e) { console.log("reply error | " + e) };
      console.log('sent buttons to clients',device_objects[device_index].mac);
    }

  });
});

wssClimate.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming climate connection ---- >>");
  ws.on('message', function incoming(message) {
    //console.log("<< ---- incoming climate message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var value = msg.value;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    //if (device_index < 0)
    if (!type) return;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    // --------------  respond to token requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsPower = ws;
      var link_obj = {};
      link_obj.linked = 1;
      try { ws.send(JSON.stringify(link_obj)) }
      catch (e) { console.log("reply error | " + e) };
      console.log((Date.now() - start_time)/1000 ,'linked climate socket',device_objects[device_index].mac);
    }

    // --------------  send buttons to clients --------------- //    
    if (cmd == "climate") {
      for (var i=0; i < groups[group_index].members.length; i++) {
        //console.log("sending buttons to ",groups[group_index].members[i]);
	//msg.message = "temperature: " + value;
        message_user(groups[group_index].members[i],'regulator climate',msg);
      }

      try { ws.send(JSON.stringify({"result":"sent"})) }
      catch (e) { console.log("reply error | " + e) };
      console.log((Date.now() - start_time)/1000 ,'sent climate to clients',device_objects[device_index].mac);
    }
  });
});

wssPower.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming power connection ---- >>");
  ws.on('message', function incoming(message) {
    //console.log("<< ---- incoming power message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var type = msg.type;
    if (!type) return;
    var local_ip = msg.local_ip;
    var value = msg.value;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    device_objects[device_index].wsPower = ws;
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    // --------------  respond to token requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsPower = ws;
      var link_obj = {};
      link_obj.linked = 1;
      try { ws.send(JSON.stringify(link_obj)) }
      catch (e) { console.log("reply error | " + e) };
      console.log((Date.now() - start_time)/1000 ,'linked power socket',device_objects[device_index].mac);
    }

    // --------------  send buttons to clients --------------- //    
    if (cmd == "power") {
      for (var i=0; i < groups[group_index].members.length; i++) {
        //console.log("sending power to ",groups[group_index].members[i]);
	//msg.message = "main_voltage: " + value;
        message_user(groups[group_index].members[i],'regulator power',msg);
      }
      //try { device_objects[device_index].wsPower.send("sent power to clients") }
      try { ws.send(JSON.stringify({"result":"sent"})) }
      catch (e) { console.log("reply error | " + e) };
      console.log((Date.now() - start_time)/1000 ,'sent power to clients',device_objects[device_index].mac);
    }
  });
});


wssLED.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming LED connection ---- >>");
  ws.on('message', function incoming(message) {
    console.log("<< ---- incoming LED message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var value = msg.value;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    //if (device_index < 0)
    if (!type) return;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    // --------------  respond to token requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsLED = ws;
      //try { ws.send("linked") }
      try { ws.send(JSON.stringify({"linked":1})) }
      catch (e) { console.log("reply error | " + e) };
      console.log('updated LED socket',device_objects[device_index].mac);
    }

    // --------------  send buttons to clients --------------- //    
    if (cmd == "LED") {
      for (var i=0; i < groups[group_index].members.length; i++) {
        //console.log("sending buttons to ",groups[group_index].members[i]);
	msg.message = "LED! " + value;
        message_user(groups[group_index].members[i],'room_sensor',msg);
      }

      try { ws.send("sent to LED clients") }
      catch (e) { console.log("reply error | " + e) };
      console.log('sent LED to clients',device_objects[device_index].mac);
    }

  });
});

wssButtons.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming buttons connection ---- >>");
  ws.on('message', function incoming(message) {
    console.log("<< ---- incoming buttons message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var value = msg.value;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    //if (device_index < 0)
    if (!type) return;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    // --------------  respond to token requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsButtons = ws;
      try { ws.send("linked") }
      catch (e) { console.log("reply error | " + e) };
      console.log('updated buttons socket',device_objects[device_index].mac);
    }

    // --------------  send buttons to clients --------------- //    
    if (cmd == "buttons") {
      for (var i=0; i < groups[group_index].members.length; i++) {
        //console.log("sending buttons to ",groups[group_index].members[i]);
	msg.message = "Button Pressed! " + value;
        message_user(groups[group_index].members[i],'room_sensor',msg);
      }

      try { ws.send("sent to buttons clients") }
      catch (e) { console.log("reply error | " + e) };
      console.log('sent buttons to clients',device_objects[device_index].mac);
    }

  });
});

wssMicrophone.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming microphone connection ---- >>");
  ws.on('message', function incoming(message) {
    console.log("<< ---- incoming microphone message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var value = msg.value;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    //if (device_index < 0)
    if (!type) return;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    // --------------  respond to token requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsMicrophone = ws;
      try { ws.send("linked") }
      catch (e) { console.log("reply error | " + e) };
      console.log('updated microphone socket',device_objects[device_index].mac);
    }
  });
});

/* DELETE wssMotion.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming motion connection ---- >>");
  ws.on('message', function incoming(message) {
    //console.log("<< ---- incoming motion message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var value = msg.value;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    if (device_index < 0) return console.log("device not found", mac);
    if (!type) return;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    // --------------  respond to token requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsMotion = ws;
      try { ws.send("linked") }
      catch (e) { console.log("reply error | " + e) };
      console.log('updated motion socket',device_objects[device_index].mac);
    }
    // --------------  send motion to clients --------------- //    
    if (cmd == "motion") {
      for (var i=0; i < groups[group_index].members.length; i++) {
        //console.log("sending motion to ",groups[group_index].members[i]);
	msg.message = "Motion Detected!";
        message_user(groups[group_index].members[i],'room_sensor',msg);
      }

      //try { ws.send("sent to motion clients") }
      //catch (e) { console.log("reply error | " + e) };
      //console.log('sent motion to clients',device_objects[device_index].mac);
    }
  });
});*/

/*wssClimate.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming climate connection ---- >>");
  ws.on('message', function incoming(message) {
    console.log("<< ---- incoming climate message ---- >>\n",message); 
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var value = msg.value;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    if (device_index < 0) return console.log("device not found", mac);
    if (!type) return;
    var device_index = find_index(device_objects,'token',token);
    if (!device_objects[device_index]) return console.log("device not found", token);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    // --------------  respond to climate requests  ----------------- //    
    if (cmd == "link") {
      device_objects[device_index].wsClimate = ws;
      try { ws.send("linked") }
      catch (e) { console.log("reply error | " + e) };
      console.log('updated motion socket',device_objects[device_index].mac);
    }
    // --------------  send climate to clients --------------- //    
    if (cmd == "light") {
      for (var i=0; i < groups[group_index].members.length; i++) {
        //console.log("sending motion to ",groups[group_index].members[i]);
	msg.message = "light level";
        message_user(groups[group_index].members[i],'room_sensor',msg);
      }

      //try { ws.send("sent to motion clients") }
      //catch (e) { console.log("reply error | " + e) };
      //console.log('sent motion to clients',device_objects[device_index].mac);
    }
  });
});*/

wssTokens.on('connection', function connection(ws) {
  console.log(TAG,"<< ---- incoming tokens connection ---- >>");  
  ws.on('message', function incoming(message) {
    console.log("<< ---- incoming tokens message ---- >>\n",message);  
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var type = msg.type;
    var local_ip = msg.local_ip;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    //console.log(TAG, "device_objects ", device_objects);
    if (!type) return;

    // --------------  respond to ping requests  ----------------- //    
    if (cmd == "png_test") {
      command = "png_test";
      try { ws.send('command' + command) }
      catch (e) { console.log("reply error | " + e) };        
      ping_time = Date.now() - ping_start;
      //console.log(mac + " | received ping, sending reply ");
    }

    // ------------------  send device info  --------------------- //    
    if (cmd == "version") {
      if (!device_objects[device_index])
        return;
      for (var j = 0; j < device_objects[device_index].groups.length; j++) {
        message_user(device_objects[device_index].groups[j],'version',msg);
        var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
        console.log("media_controller messing users",device_objects[device_index].groups[j]);
        for (var k=0; k < groups[group_index].members.length; k++) {
          message_device(groups[group_index].members[k],msg);
          message_user(groups[group_index].members[k],'version',msg);
        }
      }

      console.log("sending version number",msg);
    }

    // --------------  respond to token requests  ----------------- //    
    if (cmd == "token_request") {
      var token = crypto.createHash('sha512').update(mac).digest('hex');
      console.log(TAG,(Date.now() - start_time)/1000 ,"token_request",token);
      try { ws.send('{\"token\":\"'+token+'\"}') }
      //try { ws.send(token) }
      catch (e) { console.log("reply error | " + e) };
      var device_index = find_index(device_objects,'mac',mac);
      if (device_index < 0) {
        var device_object = { token:token, mac:mac, local_ip:local_ip, public_ip:public_ip, type:[type], groups:[] };
        database.store_device_object(device_object);
        console.log('added device',device_object.mac);
        device_object.wsTokens = ws;
        device_objects.push(device_object);
      } else {
        device_objects[device_index].token = token;
        device_objects[device_index].public_ip = public_ip;
        device_objects[device_index].local_ip = local_ip;
        device_objects[device_index].type = type;
        //if (device_objects[device_index].wsTokens) delete device_objects[device_index].wsTokens;
        //database.store_device_object(device_objects[device_index]);
        device_objects[device_index].wsTokens = ws;
        //console.log('updated device',device_objects[device_index]);
      }

      var index = find_index(groups,'group_id',mac);
      if (index < 0) {
        var group = {group_id:mac, mode:'init', type:[type], members:[mac],IR:[],record_mode:false};
        groups.push(group);
        database.store_group(group);
      }
    }

    // --------------  respond to token requests  ----------------- //    
    /*if (cmd == "buttons") {
      var token = crypto.createHash('sha512').update(mac).digest('hex');
      //try { ws.send('{\"token\":\"'+token+'\"}') }
      var command = "LIGHT1_ON";
      try { ws.send(command) }
      catch (e) { console.log("reply error | " + e) };
    }

    // --------------  respond to OTA requests  ----------------- //    
    if (cmd == "init_ota") {
      try { ws.send('{\"cmd\":\"update\",\"token\":\"'+token+'\"}') }
      //try { ws.send("TESTING!!!!") }
      catch (e) { console.log("reply error | " + e) };
      //console.log(TAG,"init_ota")
    }
    
    // ----------------  garage opener  ------------------- //
    if (type === "garage_opener") { console.log("garage_opener",msg)
    }

    // ---------------  media controller  ----------------- //
    if (type === "media_controller") {
      for (var j = 0; j < device_objects[device_index].groups.length; j++) {
        message_user(device_objects[device_index].groups[j],'media_controller',msg);
        var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
        //console.log("media_controller messing users",device_objects[device_index].groups[j]);
        for (var k=0; k < groups[group_index].members.length; k++) {
          message_device(groups[group_index].members[k],msg);
          message_user(groups[group_index].members[k],'media_controller',msg);
        }
      }
      var index = find_index(groups,'group_id',token);
      if (groups[index].record_mode.value == true) {
        var ir_index = find_index(groups[index].IR,'command',groups[index].record_mode.command);
        if (ir_index > -1) {
          groups[index].IR[ir_index].ir_codes.push(msg.ir_code);
          console.log("pushing onto ir_codes",ir_obj);
        } else {
          var ir_obj =  {command:groups[index].record_mode.command,
            ir_codes:[msg.ir_code]};
          groups[index].IR.push(ir_obj);
          console.log("storing new ir_codes",ir_obj);
        }
        groups[index].record_mode.value = false
        database.store_group(groups[index]);
        console.log("storing code",groups[index]);
      }
      //console.log("media_controller",groups[index]);
    }

    // --------------  room sensor  ----------------- //
    for (var i = 0; i < type.length; i++) {
      if (type[i] === "room_sensor") {
        //console.log("room_sensor",msg);
        //loop through groups for device group
        if (!device_objects[device_index]) return;
        for (var j = 0; j < device_objects[device_index].groups.length; j++) {
          //message group members
          var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
          msg.mode = groups[group_index].mode;
          message_user(device_objects[device_index].groups[j],'room_sensor',msg);
          for (var k=0; k < groups[group_index].members.length; k++) {
            message_device(groups[group_index].members[k],msg);
            message_user(groups[group_index].members[k],'room_sensor',msg);
          }
          if (msg.motion == "Motion Detected" && groups[group_index].mode == "armed") {
            console.log("mode",groups[group_index].mode);
            if (groups[group_index].mode == 'armed') {
              for (var k=0; k < groups[group_index].contacts.length; k++) {
                var contact = {number:groups[group_index].contacts[k].number,user:mac,msg:msg};
                console.log("room_sensor text");
                contact.name = msg.name;
                text(contact);
              }
            }
          }
        }
      }
    }
  
    // ------------  motion sensor  --------------- //
    for (var i = 0; i < type.length; i++) {
      if (type[i] === "motion_sensor") {
        //loop through groups for device group
        for (var j = 0; j < device_objects[device_index].groups.length; j++) {
          //message group members
          var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
          console.log("group",device_objects[device_index].groups[j]);
          msg.mode = groups[group_index].mode;
          message_user(device_objects[device_index].groups[j],'motion_sensor',msg);
          for (var k=0; k < groups[group_index].members.length; k++) {
            message_device(groups[group_index].members[k],msg);
            message_user(groups[group_index].members[k],'motion_sensor',msg);
          }
          if (groups[group_index].mode == 'armed') {
            for (var k=0; k < groups[group_index].contacts.length; k++) {
              var contact = {number:groups[group_index].contacts[k].number,user:mac,msg:msg};
              console.log("motion_sensor text");
              text(contact);
            }
          }
        }
      }
    }*/

    // -------- //
  });

  ws.on('close', function close() {
    for (var i=0; i < device_objects.length; i++) {
      _socket = device_objects[i].socket;
      _mac = device_objects[i].mac;
      if ( _socket === ws ) {
        device_objects.slice(i); //slice or splice??
        console.log(_mac + " | disconnected");
      }
    }
  });
  
  ws.on('error', function() {
    console.log('device websocket error catch!');
  });
});

function message_device(token,msg) {
  var device_index = find_index(device_objects,'token',token)
  if (device_index > -1)
    if (device_objects[device_index].socket)
      device_objects[device_index].socket.emit(msg.type,msg);
}

function message_user(user,event,msg) {
  //console.log("message user |",user);
  for (var j=0; j < user_objects.length; j++) {
    //console.log("message_user | " + event,user_objects[j].user);
    if (user_objects[j].user == user) {
      //console.log("message_user",user_objects[j].user);
      user_objects[j].socket.emit(event,msg);
    }
  }
}

function text(contact) {
  var text_url = "http://"+settings_obj.public_ip+":8080/open-automation.org/php/gmail.php";
  console.log("text_url",text_url);
  console.log("contact",contact);
  var response = request.post(text_url, {form: contact},
  //var response = request.post(text_url, contact,
  function (error, response, data) {
    console.log("gmail.php | ",data);   
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

var emailSent=false;
function start(server)  {
// -------------  socket.io server  ---------------- //

var io = require('socket.io').listen(server);

//io.set('origins', '*');
io.on('connection', function (socket) {
  //console.info(socket.id + " | client connected" );

  socket.on('get token', function (data) {
    var mac = data.mac;
    //var name = data.name;
    //var salt = data.salt //some random value
    var token = crypto.createHash('sha512').update(mac).digest('hex');
    data.token = token;
    var public_ip = socket.request.connection.remoteAddress;
    public_ip = public_ip.slice(7);
    data.public_ip = public_ip;
    socket.emit('get token',data);
    var index = find_index(device_objects,'token',token);
    if (index > -1) {
      //database.store_device_object(data);
      device_objects[index].socket = socket;
      console.log('get token | updated socket',mac);
    } else {
      data.groups = [mac];
      data.socket = socket;
      device_objects.push(data);
      database.store_device_object(data);
      console.log('get token | added device',mac);
    }

    //if (!groups) groups = [];
    index = find_index(groups,'group_id',mac);
    if (index < 0) {
      var group = {group_id:mac, mode:'init', type:['alarm'], members:[mac]};
      groups.push(group);
      database.store_group(group);
    }
    console.log("get token",mac);
  });

  socket.on('load settings', function (data) {
    console.log(TAG,'load settings',data.mac);
    var device_index = find_index(device_objects, 'token', data.token);
    if (device_index < 0) return console.log("device not found", data.mac);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    for (var i=0; i < groups[group_index].members.length; i++) {
      //console.log("load settings2 | member",groups[group_index].members[i]);
      message_user(groups[group_index].members[i],'load settings',data);
    }
  });

  socket.on('get settings', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log(TAG,"get settings | device not found", data.token);
    if (device_objects[index].wsTokens) return device_objects[index].wsTokens.emit('get settings',data);
    console.log("get settings",device_objects[index].mac);
    if (!device_objects[index].socket) return console.log(TAG,"get settings | socket no found",device_objects[index].mac);
    device_objects[index].socket.emit('get settings',data);
  });

  socket.on('update', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('update | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('update | socket not found',data.mac);
    device_objects[device_index].socket.emit('update',data);
  });

//---------- motion ---------//
socket.on('motion detected', function (data) {
    console.log("motion detected",data.toString());
    if(!emailSent) {
     var mailOptions = {
       from: config.mail.from_user,
       to: config.mail.to_user,
       subject: 'Motion Detected',
       text: data.toString()
     }; 
     emailSent=true;
     transporter.sendMail(mailOptions, function(error, info){
       if (error) {
         console.log(error);
       } else {
         console.log('Email sent: ' + info.response);
       }
     }); 
    }
  });
socket.on('motion stopped', function (data) {
    console.log("motion stopped",data.toString());
  });
 
//----------- ffmpeg ----------//
  socket.on('ffmpeg', function (data) {
    //console.log("hit ffmpeg",data);
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('ffmpeg | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('ffmpeg | socket not found',data.mac);
    device_objects[device_index].socket.emit('ffmpeg',data);
  });
  
  socket.on('get camera list', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return; //console.log('get camera list | device not found',data.mac);
    if (!device_objects[device_index].socket) return; //console.log('get camera list | socket not found',data.mac);
    device_objects[device_index].socket.emit('get camera list',data);
    //console.log(TAG,"get camera list",data.mac);
  });

  socket.on('camera list', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    var mac = device_objects[device_index].mac;
    var group_index = find_index(groups,'group_id',mac);
    //console.log(TAG,"camera list",mac);
    if (group_index < 0) return console.log("camera list | group not found");
    for (var i=0; i < groups[group_index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
        if (user_objects[j].user == groups[group_index].members[i]) {
          user_objects[j].socket.emit('camera list',data);
        }
      }
    }
  });

  socket.on('camera', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('camera | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('camera | socket not found',data.mac);
    device_objects[device_index].socket.emit('camera',data);
  });
  
  socket.on('ffmpeg started', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    var group_index = find_index(groups,'group_id',data.mac);
    if (group_index < 0) return console.log("ffmpeg started | no device found",data.token);
    for (var i=0; i < groups[group_index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
        if (user_objects[j].token == groups[group_index].members[i]) {
          user_objects[j].socket.emit('ffmpeg started',data);
        }
      }
    }
  });

  socket.on('folder list', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return; //console.log('folder list | device not found',data.mac);
    if (!device_objects[device_index].socket) return; //console.log('folder list | socket not found',data.mac);
    device_objects[device_index].socket.emit('folder list',data);
  });

  socket.on('folder list result', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    var mac = device_objects[device_index].mac;
    var group_index = find_index(groups,'group_id',mac);
    if (group_index < 0) return console.log("folder list result | group not found");
    for (var i=0; i < groups[group_index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
      console.log('folder list result',user_objects[j].user);
        if (user_objects[j].user == groups[group_index].members[i]) {
          user_objects[j].socket.emit('folder list result',data);
        }
      }
    }
  });
  
  socket.on('get camera preview', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log(TAG,"device not found",data.mac);
    if (!device_objects[device_index].socket) return console.log(TAG,"socket not found",data.mac);
    data.socket_id = socket.id;
    device_objects[device_index].socket.emit('get camera preview',data);
    console.log(TAG,"get_camera_preview",device_objects[device_index].mac,device_objects[device_index].socket.id);
  });

  socket.on('camera preview', function (data) {
    console.log(TAG,'camera preview',data.mac, data.camera_number);
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log(TAG,"camera preview | token not found",data.mac)
    var mac = device_objects[device_index].mac;
    var group_index = find_index(groups,'group_id',mac);
    if (group_index < 0) return console.log("camera preview | group not found");
    for (var i=0; i < groups[group_index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
        if (user_objects[j].socket.id != data.socket_id) {console.log(TAG,'same user but different socket',data.socket_id,user_objects[j].socket.id);continue}
        //if (user_objects[j].user != groups[group_index].members[i]) continue;
        user_objects[j].socket.emit('camera preview',data);
      }
    }
  });

  socket.on('command', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index > -1)
      if (device_objects[device_index].socket)
        device_objects[device_index].socket.emit('command',data);
  });

  socket.on('play', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index > -1)
      if (device_objects[device_index].socket)
        device_objects[device_index].socket.emit('play',data);
  });

  socket.on('command result', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    var mac = device_objects[device_index].mac;
    var group_index = find_index(groups,'group_id',mac);
    if (group_index < 0) return console.log("command result | group not found");
    for (var i=0; i < groups[group_index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
      console.log('command result',user_objects[j].user);
        if (user_objects[j].user == groups[group_index].members[i]) {
          user_objects[j].socket.emit('command result',data);
        }
      }
    }
  });
  
  socket.on('get contacts', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    socket.emit('get contacts',groups[group_index]);
    //console.log("get contacts",data);
  });

  socket.on('add contact', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    groups[group_index].contacts.push({label:data.label,number:data.number});
    database.store_group(groups[group_index]);
    socket.emit('add contact',data);
  });

  socket.on('remove contact', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    var user_index = groups[group_index].contacts.indexOf(data.user);
    for(var i =0;i<groups[group_index].contacts.length;i++){
      if(groups[group_index].contacts[i].label === data.user.label){
          user_index =i;
      }
    }
    groups[group_index].contacts.splice(user_index,1);
    database.store_group(groups[group_index]);
      socket.emit('remove contact',data);
  });

  socket.on('media', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return; //console.log('media | token not found');
    if (device_objects[device_index].socket)
      device_objects[device_index].socket.emit('media',data);
  });

  socket.on('set alarm', function (data) {
    for (var i = 0; i < data.members.length; i++) {
      var client_index = find_index(device_objects,'token',data.members[i]);
      if (client_index > -1)
       if (device_objects[client_index].socket)
         device_objects[client_index].socket.emit('set alarm',data);
      for (var j = 0; j < user_objects.length; j++) {
        if (user_objects[j])
          if (user_objects[j].token == data.group_id)
            user_objects[j].socket.emit('set alarm',data);
      }
    }
    database.store_group(data);
    socket.emit('set alarm',data);
    //console.log("set alarm", data);
  });

  socket.on('garage_opener', function (data) {
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (_token == data.token) {
        try { _socket.send('command' + data.command) }            
        catch (e) { console.log(e) };        
        console.log("garage_opener",data);
      }
    }
  });

  socket.on('regulator', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log(TAG,"regulator not found",data);


    /*for (var i = 0; i < device_objects.length; i++) {
      try {device_objects[i].wsPower.send(data.command);}    
      catch (e) { console.log("socket error ",device_objects[i].mac, e) };
      console.log(TAG,"sent to regulator1:",device_objects[i].mac, data.command);
    }*/

    if (!device_objects[device_index].wsPower) return console.log(TAG,"regulator socket not found",data);
    try {device_objects[device_index].wsPower.send(JSON.stringify(data))}
    catch (e) { console.log("socket error ",device_objects[device_index].mac, e) };
    console.log(TAG,"sent to regulator:",device_objects[device_index].mac, data);
  });

  socket.on('room_sensor', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log(TAG,"room_sensor not found",data);
    if (!device_objects[device_index].wsButtons) return console.log(TAG,"room_sensor socket not found",data);
    try {device_objects[device_index].wsButtons.send(data.command);}
    catch (e) { console.log("socket error ",device_objects[device_index].mac, e) };
    console.log(TAG,"sent to room_sensor:",device_objects[device_index].mac, data.command);
  });

  socket.on('room_sensor_rec', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    groups[group_index].record_mode = {command:data.command,value:true};
    console.log('room_sensor_rec',groups[group_index]);
  });

  socket.on('room_sensor_clear', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    var ir_index = find_index(groups[group_index].IR,'command',data.command);
    groups[group_index].IR[ir_index].ir_codes = [];
    database.store_group(groups[group_index]);
    console.log('room_sensor_clear',groups[group_index].IR[ir_index]);
  });

  socket.on('siren', function (data) {
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (_token == data.token) {
        try { _socket.send('command' + data.command) }            
        catch (e) { console.log(e) };        
        console.log("siren",data);
      }
    }
  });

  socket.on('login', function (data) {
    var public_ip = socket.request.connection.remoteAddress;
    public_ip = public_ip.slice(7);
    var username = data.username;
    var password = data.password;
    delete data.password;
    var mac = data.mac;
    var name = data.name;
    var index = find_index(accounts,'username',username);
    if (index < 0) return console.log("login | account not found",username);
    var user_token = crypto.createHash('sha512').update(password + accounts[index].salt).digest('hex');
    if (user_token != accounts[index].token) return console.log("login | passwords do not match");
    var token = crypto.createHash('sha512').update(mac).digest('hex');
    //var salt = data.salt //some random value
    data.public_ip = public_ip;
    data.token = token;
    data.user_token = user_token;
    socket.emit('login',data);
    delete data.username;
    delete data.user_token;
    console.log("login |", data);
    var device_index = find_index(device_objects,'token',token);
    if (device_index > -1) {
      database.store_device_object(data);
      device_objects[device_index].socket = socket;
      console.log('updated device',mac);
    } else {
      data.groups = [mac];
      database.store_device_object(data);
      data.socket = socket;
      device_objects.push(data);      
      console.log('added device',mac);
    }

    var index = find_index(groups,'group_id',username);
    if (index < 0) {
      var group = {group_id:username, mode:'init', type:['alarm'], members:[username]};
      groups.push(group);
      database.store_group(group);
    }

  });

  socket.on('set zone', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log('set zone | not found: ',data.token);
    var group_index = find_index(groups, 'group_id', device_objects[index].mac);
    if (group_index < 0) return console.log('set zone | group_id not found',device_objects[index].mac);
    if (groups[group_index].zones) {
      var zone_index = find_index(groups[group_index].zones, 'wifi', data.wifi);
      if (zone_index > -1) return console.log("set zone | zone already exist", data.wifi);
      groups[group_index].zones.push({wifi:data.wifi});
    } else {
      groups[group_index].zones = [{wifi:data.wifi}];
    }
    database.store_group(groups[group_index]);
    console.log('!! set zone !!',data.mac);
  });

  socket.on('set status', function (data) {
    if (!data.mac) return;
    var device_index = find_index(device_objects,'token',data.token);
    if (!device_objects[device_index]) return;// console.log("device not found");
    var index = find_index(status_objects,'mac',data.mac);
    if (index < 0) {
      status_object = {mac:data.mac,locations:[data.location]};
      status_objects.push(status_object);
      console.log('new status_object',data.mac);
      database.make_status_object(data);
    } else {
      //console.log("added location",status_objects[device_index].mac);
      //status_objects[device_index].locations.push(data.location);
    }
    database.store_status_object(data.mac,data.location);

    //if (!device_objects[device_index]) return console.log("no groups array in device object");
    
    for (var j = 0; j < device_objects[device_index].groups.length; j++) {
      var group_index = find_index(groups,'group_id',device_objects[device_index].groups[j]);
      //console.log("group",device_objects[device_index].groups[j]);
      data.mode = groups[group_index].mode;
      message_user(device_objects[device_index].groups[j],'set status',data);
      for (var k=0; k < groups[group_index].members.length; k++) {
        message_device(groups[group_index].members[k],data);
        message_user(groups[group_index].members[k],'set status',data);
        //console.log('member',groups[group_index].members[k]);
      }
    }

    var group_index = find_index(groups,'group_id',data.mac);
    if (group_index < 0) return;// console.log("set status | group_id not found",data.mac);
    if (!groups[group_index].zones) groups[group_index].zones = []
    for (var i = 0; i < groups[group_index].zones.length; i++) {
      if (groups[group_index].zones[i].wifi) {
        if (data.status.connected_wifi != groups[group_index].zones[i].wifi) continue;
        for (var k=0; k < groups[group_index].members.length; k++) {
          message_device(groups[group_index].members[k],data);
          message_user(groups[group_index].members[k],'active zone',data);
        }
        console.log("!! inside zone !!",data.status.connected_wifi);
      }
    }
  });

  socket.on('ping audio', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('ping audio | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('ping audio | socket not found',data.mac);
    device_objects[device_index].socket.emit('ping audio',data);
  });

  socket.on('link lights', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index > -1)
      if (device_objects[device_index].socket)
        device_objects[device_index].socket.emit('link lights',data);
  });

  socket.on('store_schedule', function (data) {
    var token = data.token;
    console.log("store_schedule | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token === token) {
    console.log("EMITTING store_schedule | " + data.token);
        _socket.emit('store_schedule', data);
      }
    }
  });

  socket.on('add zwave', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('add zwave | invalid token',data);
    if (device_objects[device_index].socket)
      device_objects[device_index].socket.emit('add zwave',data);
    console.log('add zwave',data);
  });

  socket.on('add thermostat', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('add thermostat | invalid token',data);
    if (device_objects[device_index].socket)
      device_objects[device_index].socket.emit('add thermostat',data);
    console.log('add thermostat',data);
  });

  socket.on('link_thermostat', function (data) {
    var token = data.token;
    console.log("link_thermostat | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token === token) {
        console.log("link_thermostat | " + token);      
        _socket.emit('link_thermostat', data);
      }
    }
  });

  socket.on('thermostat_state', function (data) {
    var token = data.token;
    console.log("thermostat_state | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token === token) {
        _socket.emit('thermostat_state', data);
      }
    }
  });

  socket.on('get thermostat', function (data) {
    var token = data.token;
    console.log("get thermostat | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token === token) {
        _socket.emit('get thermostat', data);
      }
    }
  });

  socket.on('set thermostat', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    //var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (device_index < 0) return console.log('set thermostat | device not found',data);
    device_objects[device_index].socket.emit('set thermostat', data);
  });

  socket.on('set lights', function (data) {
    var group_index = find_index(groups,'group_id',data.mac);
    for (var i = 0; i < groups[group_index].members.length; i++) {
      //console.log("set lights", groups[group_index].members[i]);
      var client_index = find_index(device_objects,'token',data.token);
      device_objects[client_index].socket.emit('set lights',data);
    }
  });  
  
  socket.on('device_info', function (data) {
    var token = data.token;
    console.log("device_info | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token === token) {
        console.log("relayed device_info to clients");
      }
    }
  });

  socket.on('set zwave', function (data) {
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      var _mac = device_objects[i].mac; 
      if (_token && _token === data.token) {
        _socket.emit('set zwave', data);
        console.log("set zwave",data);
      }
    }
  });

  socket.on('link user', function (data) {
    //console.log("!! LINK USER !!",data);
    var index = find_index(user_objects,'socket',socket);
    //if (index < 0) {
      data.socket = socket;
      user_objects.push(data);
      console.log('link user', data.user)
    //} else {

      console.log('socket already exists');
    //}
  });
  
  socket.on('link device', function (data) {
    var username = data.username;
    var name = data.name;
    var user_token = data.user_token;
    var token = crypto.createHash('sha512').update(data.mac).digest('hex');
    if (data.type == "lights") return console.log("trying to link lights?");

    var device_index = find_index(device_objects,'token',token);    
    if (device_index < 0) return console.log('link device | device not found',token);
    //device_objects[device_index].socket.emit('rename device', {name:name,token:token})
    var mac = device_objects[device_index].mac;
    var user_index = find_index(accounts,'token',user_token);
    if (!accounts[user_index]) return console.log("link device | no account found");
    var username = accounts[user_index].username;

    //add user to device for incoming messages
    if (device_objects[device_index].groups.indexOf(username) < 0) {
      device_objects[device_index].groups.push(username);
      device_objects[device_index].name = name;
      database.store_device_object(device_objects[device_index]);
    } //else return console.log("link device | no device found");

    //add device to user group
    var group_index = find_index(groups,'group_id',username);
    if (!groups[group_index]) return console.log("link device | no user group found ",groups);
    if (groups[group_index].members.indexOf(mac) < 0) {
      groups[group_index].members.push(mac);
      database.store_group(groups[group_index]);
    }

    //add user to device group
    var group_index = find_index(groups,'group_id',mac);
    if (group_index < 0) {
      console.log("link device | group_id not found",mac);
      var new_group = {"group_id":mac, members:[mac, username]};
      database.store_group(new_group);
    } 
    else if (groups[group_index].members.indexOf(username) < 0) {
      groups[group_index].members.push(username);
      database.store_group(groups[group_index]);
    }
    data.res = "success";
    if (data.username == "Please enter a username") return console.log("link device | unregistered device");
    //var temp_object = Object.assign({}, {});
    var temp_object = Object.assign({}, device_objects[device_index]);
    /*temp_object.mac = device_objects[device_index].mac;
    temp_object.public_ip = device_objects[device_index].public_ip;
    temp_object.type = device_objects[device_index].type;
    temp_object.groups = device_objects[device_index].groups;
    temp_object.token = device_objects[device_index].token;*/

    delete temp_object.socket;
    delete temp_object.wsButtons;
    delete temp_object.wsTokens;
    delete temp_object.wsClimate;
    delete temp_object.wsPower;
    console.log(TAG,'link device',temp_object);
    socket.emit('link device',temp_object);
    //get_devices(data,socket);
  });

  socket.on('unlink device', function (data) {
    var device_token = data.token;
    var user_token = data.user_token;
    
    var account_index = find_index(accounts,'token',user_token);
    if (account_index < 0) return console.log("unlink device | account not found");

    var device_index = find_index(device_objects,'token',device_token);
    if (device_index < 0) return console.log("unlink device | no device found",data);

    var group_index = find_index(groups,'group_id',accounts[account_index].username);
    if (group_index < 0) return console.log("unlink device | no group found",data);

    var member_index = groups[group_index].members.indexOf(device_objects[device_index].mac);
    groups[group_index].members.splice(member_index,1);
    database.store_group(groups[group_index]);
    console.log('unlink device',groups[group_index]);
    
    var user_index = device_objects[device_index].groups.indexOf(accounts[account_index].username);
    device_objects[device_index].groups.splice(user_index,1);
    database.store_device_object(device_objects[device_index]);
    socket.emit('unlink device', data);
  });
  
    
  socket.on('get devices', function (data) {
    var index = find_index(accounts,'token',data.token);
    if (index < 0) return console.log("get devices | account not found", data);
    var username = accounts[index].username;
    var devices = [];
    var group_index = find_index(groups,'group_id',username);
    if (group_index < 0) return console.log("get_devices | no group found",username);
    devices.push(groups[group_index]);
    for (var i=0; i < groups[group_index].members.length; i++) {
      var member_index = find_index(device_objects,'mac',groups[group_index].members[i]);
      if (member_index < 0) {
        //console.log("get devices | member not found",groups[group_index].members[i]);
        continue;
      }

      if (device_objects[member_index].socket)
        device_objects[member_index].socket.emit('get devices',{username:username});

      if (device_objects[member_index].type == 'room_sensor') {
	if (device_objects[member_index].wsMotion) device_objects[member_index].wsMotion.send('get device ' + username);
	else console.log(TAG,'room_sensor not connected',device_objects[member_index].mac)
      }


      //var temp_object = Object.assign({}, device_objects[member_index]);
      //delete temp_object.socket;
      var token = device_objects[member_index].token;
      var mac = device_objects[member_index].mac;
      var type = device_objects[member_index].type;
      var name = device_objects[member_index].name;

      var temp_object = {name:name, type:type, mac:mac, token:token};
      devices.push(temp_object);
    }
    //console.log('get_devices',username,devices);
    //socket.emit('get devices',{devices:devices});
    socket.emit('get devices',devices);
  });

  socket.on('load devices', function (data) {
    //var devices = [];
    var device_index = find_index(device_objects, 'token', data.token);
    var group_index = find_index(groups,'group_id',device_objects[device_index]);
    if (group_index < 0) return console.log("load devices | group not found",data.mac);
    for (var i=0; i < groups[group_index].members.length; i++) {
      message_user(groups[group_index].members[i],'load devices',data);

    }
  });

  socket.on('start stream', function (data) {
    var devices = [];
    var index = find_index(groups,'group_id',data.token);
    console.log("!! start stream !!",data.token);
    if (index < 0) return;
    for (var i=0; i < groups[index].members.length; i++) {
      for (var j=0; j < device_objects.length; j++) {
        if (groups[index].members[i] == device_objects[j].token) {
          device_objects[j].name = data.name;
          database.store_device_object(device_objects[j]);
          device_objects[j].socket.emit('start stream',data);
        }
      }
    }
  });

  socket.on('rename device', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log("rename device | token not found");
    device_objects[index].name = data.name;
    database.store_device_object(device_objects[index]);
    device_objects[index].socket.emit('rename device',data.name);
  });



  /*socket.on('set settings', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log("set settings | device not found",data.mac);
    if (device_objects[index].socket) device_objects[index].socket.emit('set settings',data);
    console.log("set settings",device_objects[index].mac);
  });*/

  socket.on('set settings', function (device) {
    var i = find_index(device_objects,'token',device.token);
    if (i < 0) return console.log('set settings | device not found',device.mac);
    if (!device_objects[i].socket) return console.log('set settings | socket not found',device.mac);
    device_objects[i].socket.emit('set settings',device);
  });

  socket.on('set device settings', function (data) {
    var i = find_index(device_objects,'token',data.token);
    if (i < 0) return console.log('set device settings | device not found',data.mac);
    if (!device_objects[i].socket) return console.log('set device settings | socket not found',data.mac);
    device_objects[i].socket.emit('set device settings',data);
    console.log(TAG,'set device settings',data)
  });

  socket.on('set resolution', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('set resolution | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('set resolution | socket not found',data.mac);
    device_objects[device_index].socket.emit('set resolution',data);
  });

  socket.on('set rotation', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('set rotation | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('set rotation | socket not found',data.mac);
    device_objects[device_index].socket.emit('set rotation',data);
  });

  socket.on('disconnect', function() {
    console.info(socket.id + " | client disconnected" );
    var index = find_index(user_objects,'socket',socket);
    if (index > -1) user_objects.splice(index,1);
  });

});
}
