// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- database.js ------------------------------------ //

var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;

get_accounts();
get_groups();
get_device_objects();
get_status_objects();

module.exports = {
  get_accounts: get_accounts,
  get_settings: get_settings,
  get_groups: get_groups,
  get_device_objects: get_device_objects,
  get_status_objects: get_status_objects,
  store_account: store_account,
  store_settings: store_settings,
  store_device_object: store_device_object,
  store_group: store_group,
  store_status_object: store_status_object,
  make_status_object: make_status_object
}

var TAG = "[database.js]";

//-- get and send settings object --//
function get_settings() {
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
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
          console.log(TAG,'get_settings | no results');
        }
        //console.log('!! get_settings !!');
        db.close();
      });
    }
  });
}

//-- store new settings --//
function store_settings(data) {
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
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
MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
  if (err) {console.log('Unable to connect to the mongoDB server. Error:', err)} 
  else {
    var collection = db.collection('groups');
    collection.find().toArray(function (err, result) {
      if (err) return err;
      if (result.length) {  
         groups = result;
         //console.log("!! get_groups !!",groups);
      }
      console.log(TAG,'get_groups | no results');
    });
  }
 db.close();
});
}

function get_device_objects() {
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
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
          console.log(TAG,'get_device_objects | no results');
        }
        db.close();
      });
    }
  });
}

function get_accounts() {
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('accounts');
      collection.find().toArray(function (err, result) {
        if (err) { 
	  console.log("get_account_objects",err);
        } else if (result.length) {
	  accounts = result;
  	  //console.log('get_accounts',accounts);	
        } else {
          console.log(TAG,'get_accounts | no results');
        }
        db.close();
      });
    }
  });
}

function get_status_objects() {
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
    if (err) console.log('Unable to connect to the mongoDB server. Error:', err);
    else {
      var collection = db.collection('states');
      collection.find().toArray(function (err, result) {
        if (err) console.log("get_status_objects",err);
        else if (result.length) {
	  status_objects = result;
  	  //console.log('get_status_objects',status_objects);	
        } 
          console.log(TAG,'get_status_objects | no results');
        db.close();
      });
    }
  });
}

//-- store things --//
function store_group(group) {
  //console.log("STORING GROUP",group);
  delete group._id;
  /* store group associations */
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('groups');
      //console.log('store_group',group);
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
  console.log('store_device_object',temp_object);
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var collection = db.collection('devices');
      collection.update({token:temp_object.token}, {$set:temp_object},{upsert:true}, function(err, item){
	if (err) {
          console.log("store_device_object",err);
        }
	console.log('item',item);
      });
      db.close();
      //get_device_objects();
    }
  });
  //console.log("store_group",groups);
}

function store_account(account) {
  var temp_object = Object.assign({}, account);
  delete temp_object.socket;
  delete temp_object._id;
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
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

function make_status_object(status_obj) {
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
    if (err) console.log('Unable to connect to the mongoDB server. Error:', err);
    else {
      var collection = db.collection('states');
      console.log('make_status_object',status_obj);
      collection.update({mac:status_obj.mac}, {$set:status_obj},{upsert:true}, function(err, item){
	if (err) console.log("make_status_object",err);
	//console.log('item',item);
      });
      db.close();
    }
  });
}

function store_status_object(mac, status) {
  if (!status) return; //console.log("no status data",mac);
  MongoClient.connect('mongodb://127.0.0.1:27017/relay', function (err, db) {
    if (err) console.log('Unable to connect to the mongoDB server. Error:', err);
    else {
      var collection = db.collection('states');
      //console.log('store_status_object',status);
      collection.insert({mac:mac, status:status}, function(err, item){
	if (err) console.log("store_status_object",err);
	//console.log('item',item);
      });
      db.close();
    }
  });
}
