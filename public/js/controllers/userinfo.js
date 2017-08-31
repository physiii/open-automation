// ------------------------------  OPEN-AUTOMATION ----------------------------------- //
// -----------------  https://github.com/physiii/open-automation  -------------------- //
// ---------------------------------- userinfo.js ------------------------------------ //


angular.module('starter.controllers', ['socket-io'])

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

.controller('userinfo', function($document, $scope, $stateParams, Categories, socket, $ionicLoading, $compile, $http, $sce, $rootScope) {
  var TAG = "[userinfo]";
  var gateways = [];
  var mobile = []; 
  var garage_openers = [];
  var motion_sensors = [];
  var media_controllers = [];
  var room_sensors = [];
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
  var url = "http://" + $rootScope.server_ip + ":" + $rootScope.port;
  var relay_socket = io.connect(url);
  $rootScope.relay_socket = relay_socket;
  console.log(TAG + "Connected to: " + url);

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

  relay_socket.on('command result', function (data) {
    var command_result = data.stdout;
    command_result = command_result.replace(/(?:\r\n|\r|\n)/g, '<br />');
    var index = $rootScope.find_index($rootScope.gateways,'token',data.token);
    $scope.$apply(function () {
      $rootScope.gateways[index].command_result = command_result;
    });
    //console.log("command result",command_result);
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

  $rootScope.alarm_status = "init";

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
    var devices = data.devices;
    var alarm_mode = "init";
    console.log('get devices',devices);
    for(var i = 0; i < devices.length; i++) {
      if (!devices[i].device_type) continue;
      for (var j=0; j < devices[i].device_type.length; j++) {

        if (devices[i].device_type[j] == "gateway") {
          var index = $rootScope.find_index(gateways,'mac',devices[i].mac);
          if (index > -1) continue;
          relay_socket.emit('get settings',{token:devices[i].token});
          //console.log("gateways: ",gateways);
          //var command = devices[i];
          //command.mode = "start";
          devices[i].stream_started = false;
          //relay_socket.emit('ffmpeg',command);
          gateways.push( devices[i] );
        }

        if (devices[i].device_type[j] == "mobile") {
          mobile.push( devices[i] );              
        }

        if (devices[i].device_type[j] == "alarm") {
          alarms.push( devices[i] );
        }

        if (devices[i].device_type[j] == "media_controller") {
          media_controllers.push( devices[i] );
        }

        if (devices[i].device_type[j] == "room_sensor") {
	  devices[i].background_color = "#222";
          room_sensors.push( devices[i] );        
        }

        if (devices[i].device_type[j] == "siren") {
  	  //console.log("siren",devices[i]);
          sirens.push( devices[i] );        
        }

        if (devices[i].device_type[j] == "garage_opener") {
          garage_openers.push( devices[i] );  
        }
      }
    }
    $scope.$apply(function () {
      $rootScope.gateways = gateways;
      $rootScope.cameras = cameras;
      $rootScope.devices = devices;
      $rootScope.garage_openers = garage_openers;
      $rootScope.mobile = mobile;
      $rootScope.alarms = alarms;
      $rootScope.media_controllers = media_controllers;
      $rootScope.room_sensors = room_sensors;
      $rootScope.sirens = sirens;
    });
  });
  
  //var camera_socket_connected = false;
  relay_socket.on('load settings', function (data) {
    load_settings(data);
    data.mode = 'preview';
    var data_obj = {mode:'preview', mac:data.mac, token:data.token}
    console.log('load settings',data.mac);
  });

  relay_socket.on('load devices', function (data) {
    //load_settings(data);
  });

  function load_settings(data) {
    var settings = data;
    var mac = settings.mac;
    var devices = settings.devices;
    var gateways = $rootScope.gateways;
    var find_index = $rootScope.find_index;

    var i = find_index(gateways,'mac',mac);
    if (i < 0) return console.log("load_settings | mac not found",mac);
    gateways[i].settings = settings;
    relay_socket.emit('get camera list',gateways[i]);
    //console.log(TAG,"load_settings",mac);
    /*key = 'thermostat';
    for (key in devices) {
      if (devices[key].device_type == 'thermostat') {
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
    }*/
    $scope.$apply(function () {
      $rootScope.gateways[i].devices = devices;
    });
  }

  $rootScope.ping_audio = function(command,token) {
    console.log('ping audio',command);
    relay_socket.emit('ping audio', {token:token, command:command});
  }

  $rootScope.find_index = function(array, key, value) {
    for (var i=0; i < array.length; i++) { 
      if (array[i][key] == value) {
        return i;
      }
    }
    return -1;
  }
})

.controller('DashCtrl', function($scope, $ionicLoading, $compile, $http) {})
