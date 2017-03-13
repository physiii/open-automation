
module.exports = {
  set_wifi_from_db: set_wifi_from_db,
  get_devices: get_devices,
  get_settings: get_settings,
  store_settings: store_settings,
  store_device: store_device
}

//module.exports.relay_server = "98.168.142.41";
//module.exports.video_relay_server = "98.168.142.41";
module.exports.relay_server = "24.253.223.242";
module.exports.video_relay_server = "24.253.223.242";

var connection = require('./connection.js');
var socket = require('./socket.js');
var utils = require('../utils.js');
// -------------------------------  MangoDB  --------------------------------- //
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;

get_devices();
get_settings();
var got_token = false;
//-- initialize variables --//

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
  	  connection.set_wifi(settings_obj);
 	  //console.log('initialize variables | ',settings_obj);
        } else {
          console.log('No document(s) found with defined "find" criteria!');
        }
        db.close();
      });
    }
  });
}

//-- get and send settings object --//

function get_settings() {
  MongoClient.connect('mongodb://127.0.0.1:27017/settings', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('settings');
      collection.find().toArray(function (err, result) {
        if (err) return console.log(err);
        var settings = {};
        if (result[0]) settings = result[0]
        module.exports.settings = settings;
        if (!got_token) {
          if (settings.token)
            var settings_obj = { mac:utils.mac, device_type:["gateway"], local_ip:utils.local_ip, public_ip:utils.public_ip };
          else 
            var settings_obj = { mac:utils.mac, device_type:["gateway"], local_ip:utils.local_ip, public_ip:utils.public_ip, token:settings.token };
          console.log("fetching token...");
          socket.relay.emit('get token',settings_obj);
          store_settings(settings_obj);
        }
        socket.relay.emit('load settings',settings);
        console.log("get_settings",result[0]);
      });
    }
    db.close();
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
  //get_settings();
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

