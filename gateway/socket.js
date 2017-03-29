module.exports = {
  relay: relay
}
var database = require('./database');
var exec = require('child_process').exec;

var relay = require('socket.io-client')("http://"+database.relay_server);
module.exports.relay = relay;
console.log('socket io:',database.relay_server);
/*function start_relay() {
  relay_connected = true;
}*/

relay.on('get token', function (data) {
  var settings = database.settings;
  settings.token = data.token;
  database.store_settings(settings);
  database.got_token = true;
  console.log("token received, sending settings");
  relay.emit('load settings',settings);
});

relay.on('set settings', function (data) {
  //data = {'device_name':data.device_name,'media_enabled':data.media_enabled,'camera_enabled':data.camera_enabled};
  database.store_settings(data);
  console.log("set settings |  ", data);
});


relay.on('store_schedule', function (data) {

/*MongoClient.connect('mongodb://127.0.0.1:27017/devices', function (err, db) {
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
});*/
  console.log("store_schedule |  " + data);  
});

relay.on('command', function (data) {
  var command = data.command;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      relay.emit('command result',data);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   relay.emit('command result',data);
  });
  console.log('command',command);
});

/*relay.on('motion list', function (data) {
  var command = "ls -lahR --full-time /var/lib/motion/*";
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      data.error = error;
      relay.emit('motion list result',data);
      return;
    }
    //console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    data.stdout = stdout;
    data.stderr = stderr;
   relay.emit('motion list result',data);
  });
  console.log('motion list',command);
});*/

relay.on('update', function (data) {
  var command =  ['pull'];
  var git = spawn('git', command);

  git.stdout.on('data', (data) => {console.log(`update: ${data}`)});
  git.stderr.on('data', (data) => {console.log(`stderr: ${data}`)});
  git.on('close', (code) => {});
  exec("pm2 restart relay gateway", (error, stdout, stderr) => {
    if (error) {return console.error(`exec error: ${error}`)}
    console.log(stdout);
    console.log(stderr);
  });
});


relay.on('get settings', function (data) {
  //database.store_settings({'device_name':data.device_name,'device_type':data.device_type});
  var settings = database.settings;
  relay.emit('load settings', settings);
  console.log("load settings |", settings);
});

relay.on('get devices', function (data) {
  console.log("get devices",data);
  database.get_devices();
});

relay.on('rename device', function (data) {
  console.log("!! rename device !!",data);
  database.store_settings(data);
});


relay.on('disconnect', function() {
  console.log("disconnected, setting got_token false");
  got_token = false;
});

