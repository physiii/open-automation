const crypto = require('crypto');
var request = require('request');
var WebSocketServer = require("ws").Server;
var express = require('express');
var url = require('url');
var app = express();
var port = 5000;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

//var client_objects = [];
var device_objects = [];
var user_objects = [];
var groups = [];
var accounts = [];

// -------------------------------  web stuff  --------------------------------- //
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    var index = find_index(accounts,'username',username);
    if (index < 0) return console.log("account not found",username);
    var token = crypto.createHash('sha512').update(password + accounts[index].salt).digest('hex');
    if (token != accounts[index].token) return console.log("passwords do not match");
    return done(null, token);
    /*User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        //return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        //return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });*/
  }
));

app.set('view engine', 'ejs');
app.use(allowCrossDomain);
app.use(allowCrossDomain);
app.use('/', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  //res.sendFile(__dirname + '/index.html');
  res.render('pages/index')
});

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    console.log("authenticated",req.user);
    res.json({"token":req.user});
  });

app.post('/register', function(req, res) {
  var username = req.body.username;
  
  var index = find_index(accounts,'username',username);
  if (index < 0) {
    var account_obj = {username:username};
    account_obj.salt = Math.random().toString(36).substring(7);
    var token = crypto.createHash('sha512').update(req.body.password + account_obj.salt).digest('hex');
    account_obj.token = token;
    account_obj.timestamp = Date.now();
    store_account(account_obj);
    accounts.push(account_obj);
  } else {
    res.json({error:"account already exists"});
    return console.log("account already exist!");
  }
  
  var index = find_index(groups,'group_id',token);
  if (index < 0) {
    var group = {group_id:token, mode:'init', user:username, device_type:['human'], contacts:[], members:[token]};    
    store_group(group);
  } else {
    res.json({error:"group already exists"});
    return console.log("group already exist!");
  }
  
  var result = {username:username, token:token};
  res.json(result);
  console.log("registered account",account_obj);
});

app.get('/home', function(req, res) {
    res.render('pages/home');
});

server.listen(port);
console.log('clients on port ' + port);


get_mac();
function get_mac () {
require('getmac').getMac(function(err,macAddress){
  if (err)  throw err
  mac = macAddress.replace(/:/g,'').replace(/-/g,'').toLowerCase();
  var token = crypto.createHash('sha512').update(mac).digest('hex');
  store_settings({mac:mac,token:token});
  console.log("Mac: (" + mac + ")");
});
}

main_loop();
function main_loop () {
setTimeout(function () {
  get_public_ip();
  main_loop();
  //console.log("main loop");
}, 60*1000);
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
// -------------------------------  MongoDB  --------------------------------- //
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;
get_accounts();
get_groups();
get_device_objects();
get_user_objects();
//get_device_objects();


//-- initialize variables --//
MongoClient.connect('mongodb://127.0.0.1:27017/settings', function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    var collection = db.collection('settings');
    collection.find().toArray(function (err, result) {
      if (err) {
        console.log("initialize",err);
      } else if (result.length) {
	settings_obj = result[0];
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
	  console.log("get_settings",err);
        } else if (result.length) {
	  settings_obj = result[0];
  	//console.log('load settings',settings_obj);	
        } else {
	  console.log('No document(s) found with defined "find" criteria!');
        }
        //console.log('!! get_settings !!');
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


//-- get things --//
function get_groups() {
MongoClient.connect('mongodb://127.0.0.1:27017/groups', function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    var collection = db.collection('groups');
    collection.find().toArray(function (err, result) {
      if (err) {
        console.log("get_groups",err);
      } else if (result.length) {
        groups = result;
	console.log("get_groups");
      } else {
        console.log('No document(s) found with defined "find" criteria!');
      }
      db.close();
    });
  }
});
}

function get_device_objects() {
  MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('devices');
      collection.find().toArray(function (err, result) {
        if (err) { 
	  console.log("get_device_objects",err);
        } else if (result.length) {
	  device_objects = result;
  	  //console.log('get_device_objects',device_objects);	
        } else {
	  console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
}

function get_accounts() {
  MongoClient.connect('mongodb://127.0.0.1:27017/accounts', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('accounts');
      collection.find().toArray(function (err, result) {
        if (err) { 
	  console.log("get_account_objects",err);
        } else if (result.length) {
	  accounts = result;
  	  //console.log('get_device_objects',client_objects);	
        } else {
	  console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
}

function get_user_objects() {
  MongoClient.connect('mongodb://127.0.0.1:27017/clients', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('users');
      collection.find().toArray(function (err, result) {
        if (err) { 
	  console.log("get_user_objects",err);
        } else if (result.length) {
	  user_objects = result;
  	  //console.log('get_device_objects',client_objects);	
        } else {
	  console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
}

//-- store things --//
function store_group(group) {
  console.log("STORING GROUP",group);
  delete group._id;
  /* store group associations */
  MongoClient.connect('mongodb://127.0.0.1:27017/groups', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('groups');
      console.log('store_group_state');

      collection.update({group_id:group.group_id}, {$set:group},{upsert:true}, function(err, item){
	if (err) {
          console.log("store_group",err);
        }
	//console.log('item',item);
      });
      db.close();
      get_groups();
    }
  });
  //console.log("store_group",groups);
}

function store_device_object(device_object) {
  var temp_object = Object.assign({}, device_object);
  delete temp_object.socket;
  delete temp_object._id;
  //console.log("temp_object",temp_object);
  //console.log('store_device_object',temp_object);
  MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('devices');
      collection.update({token:temp_object.token}, {$set:temp_object},{upsert:true}, function(err, item){
	if (err) {
          console.log("store_device_object",err);
        }
	//console.log('item',item);
      });
      db.close();
      //get_device_objects();
    }
  });
  //console.log("store_group",groups);
}

function store_user_object(user_object) {
  var temp_object = Object.assign({}, user_object);
  delete temp_object.socket;
  delete temp_object._id;
  MongoClient.connect('mongodb://127.0.0.1:27017/clients', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('clients');
      //console.log('store_device_object',temp_object);
      collection.update({token:temp_object.token}, {$set:temp_object},{upsert:true}, function(err, item){
	if (err) {
          console.log("store_user_object",err);
        }
	//console.log('item',item);
      });
      db.close();
      //get_user_objects();
    }
  });
}

function store_account(account) {
  var temp_object = Object.assign({}, account);
  delete temp_object.socket;
  delete temp_object._id;
  MongoClient.connect('mongodb://127.0.0.1:27017/accounts', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('accounts');
      //console.log('store_device_object',temp_object);
      collection.update({token:temp_object.token}, {$set:temp_object},{upsert:true}, function(err, item){
	if (err) {
          console.log("store_account_object",err);
        }
	//console.log('item',item);
      });
      db.close();
      //get_user_objects();
    }
  });
}

// --------------  websocket server for devices  ----------------- //
var ws_port = 4000;
var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: ws_port });
console.log('devices on port %d', ws_port);

wss.on('connection', function connection(ws) {

  try { ws.send('Hello from relay server!') }
  catch (e) { console.log("error: " + e) };
  
  ws.on('message', function incoming(message) {
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
    if (cmd == "tok_req") {
      var token = crypto.createHash('sha512').update(mac).digest('hex');
      try { ws.send('{\"token\":\"'+token+'\"}') }            
      catch (e) { console.log("reply error | " + e) };

      var index = find_index(device_objects,'token',token);
      if (index < 0) {
        var device_object = { token:token, mac:mac, local_ip:local_ip, public_ip:public_ip, device_type:device_type, groups:[], socket:ws };
        store_device_object(device_object);
        device_objects.push(device_object);
        console.log('added device',device_object.mac);
      } else {
        device_objects[index].public_ip = public_ip;
        device_objects[index].local_ip = local_ip;
        device_objects[index].device_type = device_type;
        store_device_object(device_objects[index]);
        device_objects[index].socket = ws;
        //console.log('updated device',device_objects[index].mac);
      }
     
      var index = find_index(groups,'group_id',token);
      if (index < 0) {
        var group = {group_id:token, mode:'init', device_type:['alarm'], members:[token],IR:[],record_mode:false};
        groups.push(group);
        store_group(group);
      }
    }

    
    // ----------------  garage opener  ------------------- //
    if (device_type === "garage_opener") {
      for (var i=0; i < user_objects.length; i++) {
        _token = device_objects[i].token;
        //console.log("garage_opener | " + token+":"+_token);
        if (_token && _token === token) {
          _socket = device_objects[i].socket;
          _mac = device_objects[i].mac;
          _socket.emit('garage_opener', msg );  
          console.log(mac + " | sending message to client ");
        }
      }
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
        store_group(groups[index]);
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
        device_objects.slice(i);
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

function message_user(token,event,msg) {
      for (var j=0; j < user_objects.length; j++) {
        //console.log(event,user_objects[j].token);
        if (user_objects[j].token == token) {
          user_objects[j].socket.emit(event,msg);
        }
      }
  /*for (var i = 0; i < user_objects.length; i++) {
    if (user_objects[i].token == token) {
      console.log('message_user',msg.device_type)
      user_objects[i].socket.emit(event,msg);
    }
  }*/
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

// -------------  socket.io server  ---------------- //
io.on('connection', function (socket) {
  //console.info(socket.id + " | client connected" );

  socket.on('get token', function (data) {
    var public_ip = socket.request.connection.remoteAddress;
    public_ip = public_ip.slice(7);
    var device_name = data.device_name;
    //var salt = data.salt //some random value
    var token = crypto.createHash('sha512').update(data.mac).digest('hex');
    var temp_object = Object.assign({}, data);
    temp_object.token = token;
    temp_object.public_ip = public_ip;
    socket.emit('get token',temp_object);
    store_device_object(temp_object);
    temp_object.socket = socket;
    var index = find_index(device_objects,'token',token);
    if (index > -1) {
      device_objects[index] = temp_object;
      //console.log('updated client',temp_object.mac);
    } else {
      device_objects.push(temp_object);
      store_device_object(temp_object);
      console.log('added client',temp_object.mac);
    }
    
    var index = find_index(groups,'group_id',token);
    if (index < 0) {
      var group = {group_id:token, mode:'init', device_type:['alarm'], members:[token]};
      groups.push(group);
      store_group(group);
    }
  });

  socket.on('get user token', function (data) {
    var public_ip = socket.request.connection.remoteAddress;
    public_ip = public_ip.slice(7);
    var device_name = data.device_name;
    var token = crypto.createHash('sha512').update(data.mac).digest('hex');
    var temp_object = Object.assign({}, data);
    temp_object.token = token;
    temp_object.public_ip = public_ip;
    socket.emit('get token',temp_object);
    store_user_object(temp_object);
    temp_object.socket = socket;
    user_objects.push(temp_object);
    store_user_object(temp_object);
    console.log('added user',temp_object.mac);    
    var index = find_index(groups,'group_id',token);
    if (index < 0) {
      var group = {group_id:token, mode:'init', device_type:['alarm'], user:temp_object.mac, contacts:[], members:[token]};
      groups.push(group);
      store_group(group);
    }
  });

//----------- ffmpeg ----------//
  socket.on('ffmpeg', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('device not found',data);
    if (!device_objects[device_index].socket) return console.log('socket not found',data);
    device_objects[device_index].socket.emit('ffmpeg',data);
  });

  socket.on('ffmpeg started', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    if (group_index < 0) return console.log("no device found");
    for (var i=0; i < groups[group_index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
        if (user_objects[j].token == groups[group_index].members[i]) {
          user_objects[j].socket.emit('ffmpeg started',data);
        }
      }
    }
  });

  socket.on('ssh', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index > -1)
      if (device_objects[device_index].socket)
        device_objects[device_index].socket.emit('ssh',data);
  });

  socket.on('ssh_out', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    if (group_index < 0) return console.log("no device for ssh_out");
    for (var i=0; i < groups[group_index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
        if (user_objects[j].token == groups[group_index].members[i]) {
          user_objects[j].socket.emit('ssh_out',data);
        }
      }
    }
  });

  socket.on('camera', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index > -1)
      if (device_objects[device_index].socket)
        device_objects[device_index].socket.emit('camera',data);
  });

  socket.on('get contacts', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    socket.emit('get contacts',groups[group_index]);
    console.log("get contacts",data);
  });

  socket.on('add contact', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    groups[group_index].contacts.push({label:data.label,number:data.number});
    store_group(groups[group_index]);
    console.log("add contact",data);
  });

  socket.on('remove contact', function (data) {
    var group_index = find_index(groups,'group_id',data.user_token);
    var user_index = groups[group_index].contacts.indexOf(data.user);
    groups[group_index].contacts.slice(user_index,1);
    store_group(groups[group_index]);
    console.log("remove contact",data);
  });

  socket.on('media', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('media | invalid token',data);
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
    store_group(data);
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
      store_group(groups[group_index]);
      console.log('room_sensor_clear',groups[group_index].IR[ir_index]);
    } else {*/

    //}
  });

  socket.on('room_sensor_clear', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    var ir_index = find_index(groups[group_index].IR,'command',data.command);
    groups[group_index].IR[ir_index].ir_codes = [];
    store_group(groups[group_index]);
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

  socket.on('link mobile', function (data) {
    var server = data.server;
    var public_ip = socket.request.connection.remoteAddress;
    data.public_ip = public_ip.slice(7);
    var token = data.token;
    var user = data.user;
    //var user_token = data.token;
    var device_token = data.token;
    var index = find_index(device_objects,'token',token);
    if (index > -1) {
      //device_objects[index].token = data.token;
      data.groups = [data.token];
      device_objects[index] = data;
      store_device_object(data);
      console.log('updated mobile',data);
    } else {
      data.groups = [data.token];
      device_objects.push(data);
      store_device_object(data);
      console.log('added mobile',data);
    }
    var index = find_index(groups,'group_id',token);
    if (index < 0) {
      var group = {group_id:token, mode:'init', members:[token]};
      groups.push(group);
      store_group(group);
    }

    //add device to user group
    var index = find_index(groups,'user',user);
    if (!groups[index]) return console.log("user not found in groups");
    user_token = groups[index].group_id;
    //console.log("members of " + user + " are " + groups[index].members);
    if (groups[index].members.indexOf(device_token) < 0) {
      console.log("adding mobile token to user group",groups[index]);
      groups[index].members.push(device_token);
      store_group(groups[index]);
    }

    //add user to device group
    var index = find_index(groups,'group_id',token);
    if (groups[index].members.indexOf(user_token) < 0) {
      groups[index].members.push(user_token);
      store_group(groups[index]);
    }

    socket.emit('link mobile',data);
  });


  //TODO: make this access local mysql (goal is to move all php/mysql to nodejs/mongo)
  socket.on('set mobile', function (data) {
    var token = crypto.createHash('sha512').update(data.mac).digest('hex');
    data.token = token;
    var response = request.post(data.server, {form: data},
    function (error, response, data) {
      console.log("set_mobile.php | ", data);
      socket.emit('token',data);
    });
  });

  socket.on('set zone', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log('device_object not found: ',data.token);
    if (device_objects[index].zones) {
      device_objects[index].zones.push(data);
    } else {
      device_objects[index].zones = [data];
    }
    store_device_object(device_objects[index]);
    console.log('!! set zone !!',data.mac);
  });

  socket.on('set location', function (data) {
    var index = find_index(device_objects,'token',data.token);
    if (index < 0) return console.log('device_object not found: ',data.token);
    console.log('set location',device_objects[index].mac);
    device_objects[index].current_location = data;
    if (device_objects[index].locations) {
      device_objects[index].locations.push(data);
    } else {
      device_objects[index].locations = [data];
    }
    store_device_object(device_objects[index]);

    if (!device_objects[index].groups)
      return console.log("no groups found in device_objects",device_objects[index]);
    for (var j = 0; j < device_objects[index].groups.length; j++) {
      var group_index = find_index(groups,'group_id',device_objects[index].groups[j]);
      //console.log("group",device_objects[index].groups[j]);
      data.mode = groups[group_index].mode;
      message_user(device_objects[index].groups[j],'set location',data);
      for (var k=0; k < groups[group_index].members.length; k++) {
        //message_device(groups[group_index].members[k],data);
        console.log('member',groups[group_index].members[k]);
        message_user(groups[group_index].members[k],'set location',data);
      }
    }
    
    if (!device_objects[index].zones) return console.log("no zones in device object");
    for (var i = 0; i < device_objects[index].zones.length; i++) {
      if (device_objects[index].zones[i].wifi) {
        if (data.current_wifi == device_objects[index].zones[i].wifi) {
          for (var j = 0; j < device_objects[index].groups.length; j++) {
            var group_index = find_index(groups,'group_id',device_objects[index].groups[j]);
            //console.log("group",device_objects[index].groups[j]);
            data.mode = groups[group_index].mode;
            message_user(device_objects[index].groups[j],'active zone',data);
            for (var k=0; k < groups[group_index].members.length; k++) {
              message_device(groups[group_index].members[k],data);
              message_user(groups[group_index].members[k],'active zone',data);
            }
          }
          console.log("!! inside zone !!",data.current_wifi);
        }
      }
    }
  });

  socket.on('to mobile', function (data) {
    var token = data.token;
    for (var i=0; i < device_objects.length; i++) {
      _token = device_objects[i].token;
      if (_token && _token === token) {
        _socket = device_objects[i].socket;
        _mac = device_objects[i].mac;
        //console.log(_mac + " | to_mobile " + data.command);
        _socket.emit('to_mobile', data);
      }
    }
  });
  
  socket.on('from_mobile', function (data) {
    try { data = JSON.parse(data) }
    catch (e) { console.log("invalid json") }    
    var token = data.token;
    for (var i=0; i < device_objects.length; i++) {
      _token = device_objects[i].token;
      if (_token && _token === token) {
        _socket = device_objects[i].socket;
        _mac = device_objects[i].mac;
        _socket.emit('from_mobile', data);
        //console.log(data.mac + " | from_mobile " + JSON.stringify(data));
      }
    }
  });

  socket.on('add_zwave_device', function (data) {

    var group_index = find_index(groups,'group_id',data.token);
    for (var i = 0; i < groups[group_index].members.length; i++) {
      var device_index = find_index(device_objects,'token',data.token);
      device_objects[device_index].socket.emit('add_zwave_device', data);
    }

    /*var token = data.token;
    console.log("add_zwave_device | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token == token) {
        _socket.emit('add_zwave_device', data);
      }
    }*/
  });

  socket.on('link lights', function (data) {
    var device_index = find_index(device_objects,'token',data.token);
    if (device_index > -1)
      if (device_objects[device_index].socket)
        device_objects[device_index].socket.emit('link lights',data);

    /*var index = find_index(device_objects,'token',data.token);
    if (index > -1) {
       console.log("link lights1",data);
      if (device_objects[index].socket) {
        console.log("link lights2",data);
        device_objects[index].socket.emit('link light',data);
      }
    }*/
    /*var token = data.token;
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      var _mac = device_objects[i].mac; 
      if (_token === token) {
        _socket.emit('link lights', data);
        console.log("link lights",data);
      }
    }*/
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


  socket.on('add thermostat', function (data) {

    var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log('media | invalid token',data);
    if (device_objects[device_index].socket)
      device_objects[device_index].socket.emit('add thermostat',data);

    console.log('add thermostat',data);
    /*var device_index = find_index(device_objects,'token',data.token);
    if (device_index < 0) return console.log("add thermostat | invalid token",data);
    if (device_objects[device_index].socket)
      device_objects[device_index].socket.emit('add thermostat', data);*/



    /*for (var i = 0; i < groups[group_index].members.length; i++) {
    }

    var token = data.token;
    console.log("add thermostat | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token === token) {
        console.log("add thermostat | " + token);      
        _socket.emit('add thermostat', data);
      }
    }*/
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

  socket.on('set_thermostat', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    for (var i = 0; i < groups[group_index].members.length; i++) {
      var device_index = find_index(device_objects,'token',data.token);
      device_objects[device_index].socket.emit('set_thermostat', data);
    }
    /*var token = data.token;
    console.log("set_thermostat | " + token);
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (token && _token === token) {
        _socket.emit('set_thermostat', data);
      }
    }*/
  });

  socket.on('set lights', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
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
      console.log('added user', data.user)
    } else console.log('socket already exists');
  });
  
  socket.on('link device', function (data) {
    if (data.device_type == "lights") {
      console.log("trying to link lights?");
      return;
    }
    var device_token = crypto.createHash('sha512').update(data.mac).digest('hex');
    var user_token = data.user_token;
    var device_name = data.device_name;

    //add device to user group
    var index = find_index(groups,'group_id',user_token);
    if (groups[index].members.indexOf(device_token) < 0) {
      groups[index].members.push(device_token);
      store_group(groups[index]);
    }

    //add user to device group
    var index = find_index(groups,'group_id',device_token);
    if (groups[index].members.indexOf(user_token) < 0) {
      groups[index].members.push(user_token);
      store_group(groups[index]);
    }

    //add user to device for incoming messages
    var index = find_index(device_objects,'token',device_token);
    if (device_objects[index].groups.indexOf(user_token) < 0) {
      device_objects[index].groups.push(user_token);
      store_device_object(device_objects[index]);
    }

    console.log('link device1',groups[index]);
    data.token = user_token;
    get_devices(data,socket);
  });

  socket.on('unlink device', function (data) {
    var device_token = crypto.createHash('sha512').update(data.mac).digest('hex');
    var user_token = data.user_token;

    var index = find_index(groups,'group_id',user_token);
    var index2 = groups[index].members.indexOf(device_token);
    store_group(groups[index]);

    var index = find_index(device_objects,'token',device_token);
    var index2 = device_objects[index].groups.indexOf(user_token);
    device_objects[index].groups.splice(index,1);
    store_device_object(device_objects[index]);
    console.log('unlink device',groups[index]);
  });
  

  socket.on('get devices', function (data) {
    get_devices(data,socket);
  });

  function get_devices(data,socket) {
    var devices = [];
    var group_index = find_index(groups,'group_id',data.token);
    if (group_index < 0) return console.log("no group found",data);
    devices.push(groups[group_index]);
    for (var i=0; i < groups[group_index].members.length; i++) {
      //console.log('get_devices1',groups[group_index].members[i]);
      var client_index = find_index(device_objects,'token',groups[group_index].members[i]);
      if (client_index < 0)
        var device_index = find_index(device_objects,'token',groups[group_index].members[i]);
      if (device_objects[client_index]) {
        var temp_object = Object.assign({}, device_objects[client_index]);
        delete temp_object.socket;
        devices.push(temp_object);
      } else
      if (device_objects[device_index]) {
        var temp_object = device_objects[device_index];
        delete temp_object.socket
        devices.push(temp_object)
      } 
    }
    //console.log('get_devices2',devices);
    socket.emit('get devices',{devices:devices});
  }

  socket.on('load devices', function (data) {
    var devices = [];
    var index = find_index(groups,'group_id',data.token);
    if (index < 0) return;
    for (var i=0; i < groups[index].members.length; i++) {
      for (var j=0; j < user_objects.length; j++) {
        if (groups[index].members[i] == user_objects[j].token) {
          user_objects[j].socket.emit('load devices',data);
        }
      }
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
          store_device_object(device_objects[j]);
          device_objects[j].socket.emit('start stream',data);
        }
      }
    }
  });

  socket.on('rename device', function (data) {
    var devices = [];
    var index = find_index(groups,'group_id',data.token);
    console.log("!! rename device !!",data.token);
    if (index < 0) return;
    for (var i=0; i < groups[index].members.length; i++) {
      for (var j=0; j < device_objects.length; j++) {
        if (groups[index].members[i] == device_objects[j].token) {
          device_objects[j].device_name = data.device_name;
          store_device_object(device_objects[j]);
          device_objects[j].socket.emit('rename device',data);
        }
      }
    }
  });

  socket.on('update', function (data) {
    var devices = [];
    var index = find_index(groups,'group_id',data.token);
    console.log("!! update device !!",data.token);
    if (index < 0) return;
    for (var i=0; i < groups[index].members.length; i++) {
      for (var j=0; j < device_objects.length; j++) {
        if (groups[index].members[i] == device_objects[j].token) {
          device_objects[j].device_name = data.device_name;
          store_device_object(device_objects[j]);
          if (device_objects[j].socket)
            device_objects[j].socket.send(JSON.stringify({"update":true}));
        }
      }
    }
  });


  socket.on('load settings', function (data) {
    var group_index = find_index(groups,'group_id',data.token);
    if (group_index < 0) return;
    for (var i=0; i < groups[group_index].members.length; i++) {
      message_user(groups[group_index].members[i],'load settings',data);
      /*for (var j=0; j < user_objects.length; j++) {
        //console.log('load settings3',groups[group_index].members[i]);
        if (user_objects[j].token == groups[group_index].members[i]) {
          user_objects[j].socket.emit('load settings',data);
        }
      }*/
    }
  });

  socket.on('set settings', function (data) {
    for (var i=0; i < device_objects.length; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      if (_token && _token === data.token) {
        _socket.emit('set settings', data);
        console.log(data.mac + " | set settings " + data);
      }
    }
  });

  socket.on('get settings', function (data) {
    var index = find_index(groups,'group_id',data.token);
    if (index < 0) return;

    for (var i=0; i < groups[index].members.length; i++) {
      socket.emit('set alarm',groups[index]);
      var index2 = find_index(device_objects,'token',groups[index].members[i]);
      if (device_objects[index2]) {
        if (device_objects[index2].socket) {
          device_objects[index2].socket.emit('get settings',data);
        }
      }
    }
  });

  socket.on('gateway', function (data) {
    var token = data.token;
    var array_size = device_objects.length;
    for (var i=0; i < array_size; i++) {
      var _socket = device_objects[i].socket;
      var _token = device_objects[i].token;
      var _mac = device_objects[i].mac; 
      if (_token && _token === token) {
        //_socket.emit('gateway', data);
        //i = device_objects.length; //to exist loop, should work without this?
        _socket.emit('gateway', data);
        console.log(_mac + " | relayed data to gateway ");
      }
    }
  });
  
  /*socket.on('png_test', function (data) {
    //console.log(data.mac + " | received ping, sending reply");
    socket.emit('png_test',{command:"ping!"});
    timeout();
function timeout() {
    setTimeout(function () {
        //console.log(socket.id + ' | ping!');
        socket.emit('png_test',{ping:"ping!"});
        timeout();
    }, 10000);
}
  });*/

  socket.on('disconnect', function() {
    //var index = find_index(device_objects,'socket',socket);
    //if (index > -1) device_objects.splice(index,1);
    var index = find_index(user_objects,'socket',socket);
    if (index > -1) user_objects.splice(index,1);

    //console.info(socket.id + " | client disconnected" );
  });

});


//-------------- stream ----------------//
var STREAM_SECRET = "init",
    STREAM_PORT = 8082,
    WEBSOCKET_PORT = 8084,
    STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

var stream_width = 800,
    stream_height = 600;

// Websocket Server
var socketServer = new (require('ws').Server)({port: WEBSOCKET_PORT});
socketServer.on('connection', function(socket) {
  // Send magic bytes and video size to the newly connected socket
  // struct { char magic[4]; unsigned short width, height;}
  var streamHeader = new Buffer(8);
  streamHeader.write(STREAM_MAGIC_BYTES);
  streamHeader.writeUInt16BE(stream_width, 4);
  streamHeader.writeUInt16BE(stream_height, 6);
  socket.send(streamHeader, {binary:true});
  console.log( 'new video socket connection ('+socketServer.clients.length+' total)' );
  socket.on('close', function(code, message){
    var index = find_index(user_objects,'socket',socket);
    if (index > -1) user_objects.splice(index,1);
    console.log( 'video socket closed ('+socketServer.clients.length+' total)' );
  });
  socket.onmessage = function (event) {
    var token = event.data;
    socket.token = token;
    /*var index = find_index(device_objects,'token',token);
    if (index < 0) return console.log('token not found');
    device_objects[index].camera_socket = socket;*/
    console.log("stored video token",socket.token);
  }
});

socketServer.on('disconnect', function(socket) {
    var index = find_index(user_objects,'socket',socket);
    if (index > -1) user_objects.splice(index,1);
    console.log( 'disconnect video socket ('+socketServer.clients.length+' total)' );
});


socketServer.broadcast = function(data, opts, token) {
  for( var i in this.clients ) {
    var client = this.clients[i];
    if (client.readyState != 1) {
      console.log("Client not connected ("+i+")");
      continue;
    }
    if (client.token != token) {
      //console.log("camera: "+token);
      //console.log("client:   "+client.token);
      continue;
    }
    this.clients[i].send(data, opts);
    //console.log("<< !!! SENDING BROADCAST ("+i+") !!! >>>");
  }
};

// HTTP Server to accept incomming MPEG Stream
var streamServer = require('http').createServer( function(request, response) {
  var params = request.url.substr(1).split('/');
  var token = params[0];
  var index = find_index(device_objects,'token',token);
  if (index < 0) return console.log('device not found');
  device_objects[index];
  response.connection.setTimeout(0);
  request.on('data', function(data){
    socketServer.broadcast(data, {binary:true},token);
  });
	//}
	/*else {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress + 
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}*/
}).listen(STREAM_PORT);

console.log('Listening for MPEG Stream on http://127.0.0.1:'+STREAM_PORT+'/<token>/<width>/<height>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
//------------------------------//
