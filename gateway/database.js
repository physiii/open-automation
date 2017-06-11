// -----------------------------  OPEN-AUTOMATION ------------------------- //
// ------------  https://github.com/physiii/open-automation --------------- //
// -------------------------------- database.js --------------------------- //


var connection = require('./connection.js');
var socket = require('./socket.js');
var utils = require('./utils.js');
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;

module.exports = {
  got_token: false,
  set_wifi_from_db: set_wifi_from_db,
  get_devices: get_devices,
  get_settings: get_settings,  
  store_settings: store_settings,
  store_device: store_device,
  settings, settings
}

get_devices();
get_settings();

//-- initialize variables --//
var settings = {};

function set_wifi_from_db() {
  console.log("set_wifi_from_db");
  MongoClient.connect('mongodb://127.0.0.1:27017/gateway', function (err, db) {
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
          console.log(TAG,'set_wifi_from_db | no results');
        }
        db.close();
      });
    }
  });
}

//-- get and send settings object --//
function get_settings() {
  MongoClient.connect('mongodb://127.0.0.1:27017/gateway', function (err, db) {
    if (err) return console.log('Unable to connect to the mongoDB server. Error:', err);
    var collection = db.collection('settings');
    collection.find().toArray(function (err, result) {
      if (err) return console.log(err);
      if (result[0]) settings = result[0]
      module.exports.settings = settings;
      if (!module.exports.got_token) {
        console.log("fetching token");
        socket.relay.emit('get token',{mac:utils.mac, device_type:['gateway']});          
        store_settings(settings);
      }
      settings.devices = device_array;
      //socket.relay.emit('load settings',settings);
      //console.log("get_settings",result[0]);
    });
  db.close();
});
}

//-- store new settings --//
function store_settings(data) {
  MongoClient.connect('mongodb://127.0.0.1:27017/gateway', function (err, db) {
    if (err) return console.log(err);
    var collection = db.collection('settings');
    settings[Object.keys(data)[0]] = data[Object.keys(data)[0]];
   //console.log('store_settings',settings);
    collection.update({}, {$set:data}, {upsert:true}, function(err, item){
        //console.log("item",item)
    });
    db.close();
  });
}

//-- store new device --//
function store_device(device) {
  delete device["_id"];
  MongoClient.connect('mongodb://127.0.0.1:27017/gateway', function (err, db) {
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
          console.log(TAG,'store_device | no results');
        }
      });
      db.close();
    }
  });
  get_devices();
}

//-- load devices from database --//
function get_devices() {
  MongoClient.connect('mongodb://127.0.0.1:27017/gateway', function (err, db) {
    if (err) return console.log('get_devices |', err);
    var collection = db.collection('devices');
    collection.find().toArray(function (err, result) {
      if (err) return console.log(err);
      if (!result.length) return console.log('get_devices | no results');
      device_array = result;
      var devices_obj = settings;
      devices_obj.devices = device_array;
      //console.log("get_devices", device_array);
    });
    db.close();
  });
  //console.log("!! get_devices !!");
}
