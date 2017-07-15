// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- socket.js -------------------------------------- //

var database = require('./database.js');
var utils = require('./utils.js');
var crypto = require('crypto');

module.exports = {
  start: start
}

var DEVICE_PORT = config.device_port || 4000;
var find_index = utils.find_index;
var TAG = "[socket.js]";
/* --------------  websocket server for devices  ----------------- */
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: DEVICE_PORT });
console.log('devices on port %d', DEVICE_PORT);

wss.on('connection', function connection(ws) {
  console.log("<< ---- incoming connection ---- >>");
  //try { ws.send('Hello from relay server!') }
  //catch (e) { console.log("error: " + e) };
  
  ws.on('message', function incoming(message) {
    console.log("<< ---- incoming message ---- >>\n",message);  
    var msg = {};
    try { msg = JSON.parse(message) }
    catch (e) { console.log("invalid json", message) };
    var token = msg.token;
    var mac = msg.mac;
    var cmd = msg.cmd;
    var device_type = msg.device_type;
    var local_ip = msg.local_ip;
    var public_ip = ws.upgradeReq.connection.remoteAddress;
    var device_index = find_index(device_objects,'token',token);
    //if (device_index < 0)
    if (!device_type) return;
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
      //try { ws.send('{\"token\":\"'+token+'\"}') }
      try { ws.send(token) }
      catch (e) { console.log("reply error | " + e) };

      var index = find_index(device_objects,'token',token);
      if (index < 0) {
        var device_object = { token:token, mac:mac, local_ip:local_ip, public_ip:public_ip, device_type:[device_type], groups:[], socket:ws };
        database.store_device_object(device_object);
        device_objects.push(device_object);
        console.log('added device',device_object.mac);
      } else {
        device_objects[index].public_ip = public_ip;
        device_objects[index].local_ip = local_ip;
        device_objects[index].device_type = device_type;
        database.store_device_object(device_objects[index]);
        device_objects[index].socket = ws;
        //console.log('updated device',device_objects[index].mac);
      }
     
      var index = find_index(groups,'group_id',mac);
      if (index < 0) {
        var group = {group_id:mac, mode:'init', device_type:[device_type], members:[mac],IR:[],record_mode:false};
        groups.push(group);
        database.store_group(group);
      }
    }

    // --------------  respond to OTA requests  ----------------- //    
    if (cmd == "init_ota") {
      try { ws.send('{\"cmd\":\"update\",\"token\":\"'+token+'\"}') }
      //try { ws.send("TESTING!!!!") }
      catch (e) { console.log("reply error | " + e) };
      //console.log(TAG,"init_ota")
    }

    /*if (cmd == "tok_req") {
      var token = crypto.createHash('sha512').update(mac).digest('hex');
      try { ws.send('{\"token\":\"'+token+'\"}') }            
      catch (e) { console.log("reply error | " + e) };

      var index = find_index(device_objects,'token',token);
      if (index < 0) {
        var device_object = { token:token, mac:mac, local_ip:local_ip, public_ip:public_ip, device_type:[device_type], groups:[], socket:ws };
        database.store_device_object(device_object);
        device_objects.push(device_object);
        console.log('added device',device_object.mac);
      } else {
        device_objects[index].public_ip = public_ip;
        device_objects[index].local_ip = local_ip;
        device_objects[index].device_type = device_type;
        database.store_device_object(device_objects[index]);
        device_objects[index].socket = ws;
        //console.log('updated device',device_objects[index].mac);
      }
     
      var index = find_index(groups,'group_id',mac);
      if (index < 0) {
        var group = {group_id:mac, mode:'init', device_type:[device_type], members:[mac],IR:[],record_mode:false};
        groups.push(group);
        database.store_group(group);
      }
    }*/

    
    // ----------------  garage opener  ------------------- //
    if (device_type === "garage_opener") { console.log("garage_opener",msg)
      /*for (var i=0; i < user_objects.length; i++) {
        _token = device_objects[i].token;
        //console.log("garage_opener | " + token+":"+_token);
        if (_token && _token === token) {
          _socket = device_objects[i].socket;
          _mac = device_objects[i].mac;
          _socket.emit('garage_opener', msg );  
          console.log(mac + " | sending message to client ");
        }
      }*/
    }

    // ---------------  media controller  ----------------- //
    if (device_type === "media_controller") {
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
    for (var i = 0; i < device_type.length; i++) {
      if (device_type[i] === "room_sensor") {
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
                contact.device_name = msg.device_name;
                text(contact);
              }
            }
          }
        }
      }
    }
  
    // ------------  motion sensor  --------------- //
    for (var i = 0; i < device_type.length; i++) {
      if (device_type[i] === "motion_sensor") {
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
    }

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
      device_objects[device_index].socket.emit(msg.device_type,msg);
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

function start(server)  {
// -------------  socket.io server  ---------------- //

var io = require('socket.io').listen(server);

//io.set('origins', '*');
io.on('connection', function (socket) {
  //console.info(socket.id + " | client connected" );

  socket.on('get token', function (data) {
    console.log("get token",mac);
    var mac = data.mac;
    var public_ip = socket.request.connection.remoteAddress;
    public_ip = public_ip.slice(7);
    //var device_name = data.device_name;
    //var salt = data.salt //some random value
    var token = crypto.createHash('sha512').update(mac).digest('hex');
    data.token = token;
    data.public_ip = public_ip;
    socket.emit('get token',data);
    var index = find_index(device_objects,'token',token);
    if (index > -1) {
      //database.store_device_object(data);
      device_objects[index].socket = socket;
      console.log('get token | updated socket',mac);
    } else {
      data.groups = [mac];
      database.store_device_object(data);
      data.socket = socket;
      device_objects.push(data);
      console.log('get token | added device',mac);
    }

    if (!groups) groups = [];
    index = find_index(groups,'group_id',mac);
    if (index < 0) {
      var group = {group_id:mac, mode:'init', device_type:['alarm'], members:[mac]};
      groups.push(group);
      database.store_group(group);
    }
  });

  socket.on('load settings', function (data) {
    console.log(TAG,'loaded settings',data.mac);
    var device_index = find_index(device_objects, 'token', data.token);
    if (device_index < 0) return console.log("device not found", data.mac);
    var group_index = find_index(groups,'group_id',device_objects[device_index].mac);
    if (group_index < 0) return console.log("group_id not found", data.mac);
    for (var i=0; i < groups[group_index].members.length; i++) {
      //console.log("load settings2 | member",groups[group_index].members[i]);
      message_user(groups[group_index].members[i],'load settings',data);
    }
  });

  socket.on('set settings', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log("set settings | device not found",data.mac);
    if (device_objects[index].socket) device_objects[index].socket.emit('set settings',data);
    console.log("set settings",device_objects[index].mac);
  });

  socket.on('get settings', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log("get settings | device not found", data.token);
    if (!device_objects[index].socket) return console.log("get settings | no socket found",device_objects[index].mac);
    //console.log("get settings",device_objects[index].mac);
    device_objects[index].socket.emit('get settings',data);
  });

  socket.on('update', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('update | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('update | socket not found',data.mac);
    device_objects[device_index].socket.emit('update',data);
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
    //console.log(TAG,"get_camera_preview",data.mac);
    device_objects[device_index].socket.emit('get camera preview',data);
  });

  socket.on('camera preview', function (data) {
    console.log(TAG,'camera preview',data.mac, data.camera_number);
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log(TAG,"camera preview | token not found",data.mac)
    var mac = device_objects[device_index].mac;
    var group_index = find_index(groups,'group_id',mac);
    if (group_index < 0) return console.log("camera preview | group not found");
    for (var i=0; i < groups[group_index].members.length; i++) {
          //console.log(TAG,'camera preview1',mac,groups[group_index].members[i]);
      for (var j=0; j < user_objects.length; j++) {
          //console.log(TAG,'camera preview2',mac,user_objects[j].user);
        if (user_objects[j].user == groups[group_index].members[i]) {
          user_objects[j].socket.emit('camera preview',data);
          //console.log(TAG,'camera preview3',mac,user_objects[j].user);
        }
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
    console.log("get contacts",data);
  });

  socket.on('add contact', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    groups[group_index].contacts.push({label:data.label,number:data.number});
    database.store_group(groups[group_index]);
    console.log("add contact",data);
  });

  socket.on('remove contact', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    var user_index = groups[group_index].contacts.indexOf(data.user);
    groups[group_index].contacts.slice(user_index,1);
    database.store_group(groups[group_index]);
    console.log("remove contact",data);
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

  socket.on('room_sensor_rec', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    groups[group_index].record_mode = {command:data.command,value:true};
    console.log('room_sensor_rec',groups[group_index]);
    /*if (data.clear) {
      var ir_index = find_index(groups[group_index].IR,'command',data.command);
      delete groups[group_index].IR[ir_index].ir_codes;
      database.store_group(groups[group_index]);
      console.log('room_sensor_clear',groups[group_index].IR[ir_index]);
    } else {*/
    //}
  });

  socket.on('room_sensor_clear', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    var ir_index = find_index(groups[group_index].IR,'command',data.command);
    groups[group_index].IR[ir_index].ir_codes = [];
    database.store_group(groups[group_index]);
    console.log('room_sensor_clear',groups[group_index].IR[ir_index]);
  });

  socket.on('room_sensor', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    var ir_index = find_index(groups[group_index].IR,'command',data.command);
    if (!groups[group_index].IR[ir_index]) return;
    var command_obj = {"sendIR":groups[group_index].IR[ir_index].ir_codes};
    console.log("command_obj", command_obj);
    var index = find_index(device_objects,'token',data.token);
    if (device_objects[index].socket)
      device_objects[index].socket.send(JSON.stringify(command_obj));
    else console.log("NO SOCKET?");
    console.log('room_sensor',data);
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
    var device_name = data.device_name;
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
      var group = {group_id:username, mode:'init', device_type:['alarm'], members:[username]};
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
    if (group_index < 0) return console.log("set status | group_id not found",data.mac);
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
    /*for (var i = 0; i < groups[group_index].members.length; i++) {
      var device_index = find_index(device_objects,'token',data.token);
      device_objects[device_index].socket.emit('set_thermostat', data);
    }*/
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
    var index = find_index(user_objects,'socket',socket);
    if (index < 0) {
      data.socket = socket;
      user_objects.push(data);
      console.log('link user', data.user)
    } else console.log('socket already exists');
  });
  
  socket.on('link device', function (data) {
    var username = data.username;
    var device_name = data.device_name;
    var user_token = data.user_token;
    var token = crypto.createHash('sha512').update(data.mac).digest('hex');
    if (data.device_type == "lights") return console.log("trying to link lights?");

    var device_index = find_index(device_objects,'token',token);    
    if (device_index < 0) return;// console.log('link device | device not found',token);
    //device_objects[device_index].socket.emit('rename device', {device_name:device_name,token:token})
    var mac = device_objects[device_index].mac;
   
    var user_index = find_index(accounts,'token',user_token);
    if (!accounts[user_index]) return console.log("link device | no account found");
    var username = accounts[user_index].username;

    //add user to device for incoming messages
    if (device_objects[device_index].groups.indexOf(username) < 0) {
      device_objects[device_index].groups.push(username);
      device_objects[device_index].device_name = device_name;
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
    var temp_object = Object.assign({}, device_objects[device_index]);
    delete temp_object.socket;
    console.log('link device',temp_object.mac);
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
    //console.log("get devices",username);
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
      var temp_object = Object.assign({}, device_objects[member_index]);
      delete temp_object.socket;
      devices.push(temp_object);
    }
    //console.log('get_devices2',devices);
    socket.emit('get devices',{devices:devices});
  });

  socket.on('load devices', function (data) {
    //var devices = [];
    var device_index = find_index(device_objects, 'token', data.token);
    var group_index = find_index(groups,'group_id',device_objects[device_index]);
    if (group_index < 0) return console.log("load devices | group not found",data.mac);
    for (var i=0; i < groups[group_index].members.length; i++) {
      message_user(groups[group_index].members[i],'load devices',data);
      /*for (var j=0; j < user_objects.length; j++) {
        if (groups[group_index].members[i] == user_objects[j].user) {
          user_objects[j].socket.emit('load devices',data);
        }
      }*/
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
          device_objects[j].device_name = data.device_name;
          database.store_device_object(device_objects[j]);
          device_objects[j].socket.emit('start stream',data);
        }
      }
    }
  });

  socket.on('rename device', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log("rename device | token not found");
    device_objects[index].device_name = data.device_name;
    database.store_device_object(device_objects[index]);
    device_objects[index].socket.emit('rename device',data.device_name);
    /*index = find_index(groups,'group_id',device_objects[index].mac);
    if (index < 0) return console.log("rename device | group not found");
    group[index].device_name = data.device_name;
    database.store_group(group[index]);
    for (var i=0; i < groups[index].members.length; i++) {
      var j = find_index(device_object, groups[index].members[i]);
      for (var j=0; j < device_objects.length; j++) {
        if (groups[index].members[i] == device_objects[j].token) {
          device_objects[j].device_name = data.device_name;
          database.store_device_object(device_objects[j]);
          if (!device_objects[j].socket) return console.log("rename device, device object undefined",device_objects[j].mac)
          device_objects[j].socket.emit('rename device',data);
        }
      }
    }*/
  });



  socket.on('set resolution', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('set resolution | device not found',data.mac);
    if (!device_objects[device_index].socket) return console.log('set resolution | socket not found',data.mac);
    device_objects[device_index].socket.emit('set resolution',data);
  });

  socket.on('disconnect', function() {
    var index = find_index(user_objects,'socket',socket);
    if (index > -1) user_objects.splice(index,1);
    //console.info(socket.id + " | client disconnected" );
  });

});
}
