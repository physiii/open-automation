// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- userinfo.js ------------------------------------ //


angular.module('open-automation')

.directive('flipContainer', function() {
  return {
    restrict: 'AEC',
    replace:true,
    link: function($scope, $elem, $attrs) {
      $scope.flip = function() {
        $elem.toggleClass('flip');
      }
    }
  };
})

.controller("userinfo", function ($scope, $rootScope, socket) {




  $scope.stack = "col";


  var TAG = "[userinfo]";
  var gateways = [];
  var mobile = []; 
  var garage_openers = [];
  var motion_sensors = [];
  var media_controllers = [];
  var room_sensors = [];
  var regulators = [];
  var sirens = [];
  var cameras = [];
  var sirens = [];
  var alarms = [];
  var smoke_alarms = [];
  $rootScope.alert_contacts = [];
  $rootScope.server_address = location.host;
  var parts = $rootScope.server_address.split(":");
  $rootScope.server_ip = parts[0];
  $rootScope.port = parts[1] || 80;
  $scope.showDarkTheme = true;
  var url = "http://" + $rootScope.server_ip + ":" + $rootScope.port;
  var relay_socket = io.connect(url);
  $rootScope.relay_socket = relay_socket;
  console.log(TAG + " Connected to: " + url);

  var token = $.cookie('token');
  var user = $.cookie('user');
  $rootScope.token = token;
  $rootScope.user = user;
  relay_socket.emit('link user',{token:token, user:user});
  relay_socket.emit('get devices',{token:token});
  relay_socket.emit('get contacts',{user_token:token});  


  relay_socket.on('set status', function (data) {
    var mac = data.mac;
    var mobile = $rootScope.mobile;
    for (var i = 0; i < mobile.length; i++) {
      if (mac === mobile[i].mac) {
        mobile[i] = data;
        /*mobile[i].latitude = data.latitude;
        mobile[i].longitude = data.longitude;
        mobile[i].speed = data.speed;
        mobile[i].accuracy = data.accuracy;*/
      }
    }
    $rootScope.mobile = mobile;
    //console.log("set status",data);
    $rootScope.update_map(data);
  });

  relay_socket.on('motion_sensor', function (state) {
    console.log("motion_sensor",state);
    if (state.status = 'alert') {
      $rootScope.alarm_status = state.motion;
    }
    var index = $rootScope.find_index($rootScope.room_sensors,'token',state.token);
    $scope.$apply(function () {
      console.log("motion_sensor",state);
      $rootScope.motion_sensors[index].state = state;
    });
  });

  relay_socket.on('media_controller', function (data) {
    media_controllers = $rootScope.media_controllers;
    for(var i = 0; i < media_controllers.length; i++) {
      if (media_controllers[i].token == data.token) {
        media_controllers[i].state = data;
        console.log("media_controller",media_controllers[i]);
        $scope.$apply(function () {
  	  $rootScope.media_controllers[i] = media_controllers[i];
        });
        document.getElementById(data.mac+"_screen").style.background = "#222";
        document.getElementById(data.mac+"_screen").style.color = "#fff";
      }
    }
  });

  relay_socket.on('set alarm', function (data) {
    var index = $rootScope.find_index(alarms,'group_id',data.group_id);
    if (index < 0) return;
    //console.log("set alarm",data);
    $scope.$apply(function () {
      $rootScope.alarms = alarms;
    });
    if (data.mode == "armed") {
      alarms[index].mode = "ARMED";
      document.getElementById(data.group_id+"_screen").style.background = "#9C0C1B";
      document.getElementById(data.group_id+"_lock").style.display = "inline";
      document.getElementById(data.group_id+"_unlock").style.display = "none";
    }
    if (data.mode == "disarmed") {
      alarms[index].mode = "DISARMED";
      document.getElementById(data.group_id+"_screen").style.background = "#0B7520";
      document.getElementById(data.group_id+"_lock").style.display = "none";
      document.getElementById(data.group_id+"_unlock").style.display = "inline";
    }
    if (data.mode == "night") {
      alarms[index].mode = "NIGHT MODE";
      document.getElementById(data.group_id+"_screen").style.background = "#9C0C1B";
      document.getElementById(data.group_id+"_lock").style.display = "inline";
      document.getElementById(data.group_id+"_unlock").style.display = "none";
    }
  });

  relay_socket.on('get contacts', function (data) {
    //$rootScope.alert_contacts = data.contacts;
    //console.log('get contacts | ', data);
  });

  relay_socket.on('get devices', function (data) {
    var devices = data;
    var alarm_mode = "init";
    for(var i = 0; i < devices.length; i++) {
      if (!devices[i].type) continue;
      devices[i].status = "Connecting";
      devices[i].stream_started = false;
      devices[i].show_main = true;
      devices[i].show_dashboard = false;
      devices[i].show_recordings = false;
      devices[i].show_statistics = false;
      devices[i].show_settings = false;

      if (devices[i].type == "gateway") {
        relay_socket.emit('get settings',{token:devices[i].token});
      }

      if (devices[i].type == "mobile") {
        mobile.push( devices[i] );              
      }

      if (devices[i].type == "alarm") {
	devices[i].status = "Armed"
        alarms.push( devices[i] );
      }

      if (devices[i].type == "media_controller") {
        media_controllers.push( devices[i] );
      }

      if (devices[i].type == "room_sensor") {
        devices[i].background_color = "#222";
        room_sensors.push( devices[i] );
      }

      if (devices[i].type == "regulator") {
        devices[i].background_color = "#222";
        regulators.push( devices[i] );        
      }

      if (devices[i].type == "siren") {
        sirens.push( devices[i] );        
      }

      if (devices[i].type == "garage_opener") {
        garage_openers.push( devices[i] );  
      }
    }

    $scope.$apply(function () {
      $rootScope.devices = devices;
      console.log('get devices',devices);
    });
  });
  
  //var camera_socket_connected = false;
  relay_socket.on('load settings', function (data) {
    var devices = $rootScope.devices;
    var i = find_index(devices,'mac',data.mac);
    if (i < 0) return console.log("load_settings | mac not found",data.mac);

    $scope.$apply(function () {
      $rootScope.devices[i].settings = data;
    });

    var attached_devices = data.devices;
    if (attached_devices) {
      for (var j = 0; j < attached_devices.length; j++) {
    	if (attached_devices[j].type == "camera") {

          var device_id = $rootScope.find_index(devices,"id",attached_devices[j].id);
          if (device_id > -1) continue;

          var parts = attached_devices[j].dev.replace("/dev/video","");
          if (parts.length <= 1) continue;
          if (parts[0] != 2) continue; //must set /dev/video2* as streaming camera

 	  attached_devices[j].name = attached_devices[j].camera_number;
 	  attached_devices[j].token = devices[i].token;
          attached_devices[j].show_main = true;
          attached_devices[j].previewCanvas = {show:true};
          attached_devices[j].show_canvas = true;
          attached_devices[j].videoCanvas = {show:false};
          attached_devices[j].show_dashboard_btn= true;
          attached_devices[j].span = {row:0, col:1}
          relay_socket.emit('get camera preview',{token:devices[i].token, camera_number:attached_devices[j].camera_number});
	}
	attached_devices[j].settings = devices[i].settings;
        $rootScope.devices.push(attached_devices[j]);
        $scope.$apply(function () {});
        console.log(TAG,data.mac,"added device",attached_devices[j]);
      }
    }

    /*var camera_list = data.stdout.split(/(?:\r\n|\r|\n)/g);
    camera_list.splice(0,1);
    camera_list.splice(camera_list.length - 1,1);
    var index = $rootScope.find_index($rootScope.devices,'token',data.token);
    var device = $rootScope.devices[index];
    for (var i = 0; i < camera_list.length; i++) {
      var parts = camera_list[i].split(" ");
      parts = parts[9].replace("/dev/video","");
      if (parts.length <= 1) {
        camera_list.splice(i,1);
        i--;
        continue;
      }
      if (parts[parts.length - 1] != '0') {
        camera_list.splice(i,1);
        i--;
        continue;
      }
      var camera_number = parts;
      var id = device.mac+"_"+camera_number;
      //var devices = $rootScope.devices;
      var device_id = $rootScope.find_index(devices,"id",id);
      if (device_id > -1) continue;
      
      device.device_type = "camera";
      device.id = id;
      device.camera_number = camera_number;

      //devices.push(device);
      //devices.push({id:id, mac:device.mac, name:device.device_name, camera_number:camera_number, token:device.token, device_type:"camera"});
      var j = $rootScope.devices.length - 1;
      relay_socket.emit('get camera preview',{token:device.token, camera_number:camera_number});
      device.show_video_canvas = false;
      device.show_preview_canvas = true;
      device.show_canvas = true;
      device.show_dashboard_btn= true;
      device.span = {row:0, col:1}

      $scope.$apply(function () {});
      //console.log(TAG,"camera list!",data);
    }*/


    //relay_socket.emit('get camera list',devices[i]);
    console.log('load settings',data);
  });

  relay_socket.on('load devices', function (data) {
    //load_settings(data);
  });

  /*function load_settings(data) {
    var settings = data;
    var mac = settings.mac;
    //var devices = $rootScope.devices;
    var find_index = $rootScope.find_index;

    var devices = settings.devices;
    if (devices) {
      for (var j = 0; j < devices.length; j++) {
        console.log(TAG,mac,"added device",devices[j].type);
        $rootScope.devices.push(devices[j]);
      }
    }

    var i = find_index(devices,'mac',mac);
    if (i < 0) return console.log("load_settings | mac not found",mac);
    devices[i].settings = settings;
    devices[i].status = "Connected";

    //console.log(TAG,"load_settings",mac);
    key = 'thermostat';
    for (key in devices) {
      if (devices[key].type == 'thermostat') {
        current_state = devices[key].current_state;
        if (current_state.tmode === 0) {
          current_state['mode'] = "off";
          current_state['set_temp'] = "O";   
        } 
        if (current_state.tmode === 1) {
          current_state['mode'] = "heat";
          current_state['set_temp'] = current_state.t_heat;
        }  
        if (current_state.tmode === 2) {
          current_state['mode'] = "cool";
          current_state['set_temp'] = current_state.t_cool;   
        }
        if (current_state.tmode === 3) {
          current_state['mode'] = "auto";
          current_state['set_temp'] = current_state.auto;
        }        
        if (current_state.fmode == 0) {
          current_state['fan'] = "auto";
        } 
	if (current_state.fmode == 1) {
          current_state['fan'] = "on";
        }
    	if (current_state.fmode == 2) {
          current_state['fan'] = "on2";
        }
    	if (current_state.fmode == 3) {
          current_state['fan'] = "off";
        }
	set_state = current_state;
        devices[key].set_state = set_state;
        devices[key].current_state = current_state;
        //console.log('load thermostat',devices[key]);
      }
    }
    $scope.$apply(function () {
      $rootScope.devices[i] = devices;
    });
  }*/

  $rootScope.ping_audio = function(command,token) {
    console.log('ping audio',command);
    relay_socket.emit('ping audio', {token:token, command:command});
  }

  find_index = function(array, key, value) {
    if (!array) return console.log(TAG,"array is undefined",array,key,value)
    for (var i=0; i < array.length; i++) { 
      if (array[i][key] == value) {
        return i;
      }
    }
    return -1;
  }
  $rootScope.find_index = find_index;
});

