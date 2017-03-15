angular.module('starter.controllers')

.directive('flipContainer', function() {
  return {
    restrict: 'C',
    link: function($scope, $elem, $attrs) {
      $scope.flip = function() {
        $elem.toggleClass('flip');
      }
    }
  };
})

.controller('userinfo', function($document, $scope, $stateParams, Categories, socket,$ionicLoading, $compile, $http, $sce, $rootScope) {
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
  var server_type = "local";

  console.log("<< ------  userinfo  ------ >> ");
  if (server_type == "local")
    $rootScope.server_address = location.host;
  if (server_type == "dev")
    $rootScope.server_address = "98.168.142.41";
  if (server_type == "prod")
    $rootScope.server_address = "24.253.223.242";
  
  var parts = $rootScope.server_address.split(":");
  $rootScope.server_ip = parts[0];
  $rootScope.port = parts[1];
  var relay_socket = io.connect("http://" + $rootScope.server_address);
  $rootScope.relay_socket = relay_socket;
  var token = $.cookie('token');
  var user = $.cookie('user');
  $rootScope.token = token;
  $rootScope.user = user;
  relay_socket.emit('link user',{token:token, user:user});
  relay_socket.emit('get devices',{token:token});
  relay_socket.emit('get contacts',{user_token:token});  
  //relay_socket.emit('link lights',{ mac:"TESTMAC", token:"TESTTOK" });


  $rootScope.alert_contacts = [];

  relay_socket.on('room_sensor', function (data) {
    if (data.status = 'alert') {
      $rootScope.alarm_status = data.status;
    }
    var index = $rootScope.find_index($rootScope.room_sensors,'token',data.token);
    magnitude_width = data.magnitude /100;
    if (magnitude_width > 100) magnitude_width = 100;
    document.getElementById(room_sensors[index].mac+"_magnitude").style.width = magnitude_width + "%";
    if (data.motion == "No Motion Detected") {
      document.getElementById(room_sensors[index].mac+"_motion").style.background = "#0B7520";
    }
    if (data.motion == "Motion Detected") {
      document.getElementById(room_sensors[index].mac+"_motion").style.background = "#9C0C1B";
    }
    $scope.$apply(function () {
      $rootScope.room_sensors[index].state = data;
    });
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

  relay_socket.on('folder list result', function (data) {
    var folder_list = data.stdout.split(/(?:\r\n|\r|\n)/g);
    folder_list.splice(0,1);
    folder_list.splice(folder_list.length - 1,1);

    for (var i = 0; i < folder_list.length; i++) {
      var parts = folder_list[i].split(" ");
      if (parts.length < 8) continue;
      parts.folder = data.folder;
      for (var k = 0; k < parts.length; k++) {
        if (parts[k].length < 1) {
          parts.splice(k,1);
          k--;
        }
      }

      //format date
      parts[5] = parts[5].split("-");

      //format time
      parts[6] = parts[6].split(":");
      
      
      if (parts[8].charCodeAt(0) == 46) {
        if (parts[8].charCodeAt(1) == 46) {
        } else if (parts[8].length < 2) {
          folder_list.splice(i,1);
          i--;
          continue;
        }
      }
      folder_list[i] = parts;
    }
    $scope.$apply(function () {
      var index = $rootScope.find_index($rootScope.gateways,'token',data.token);
      $rootScope.gateways[index].folder_list = folder_list;
    });
    console.log("folder list result | ",folder_list);
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

  relay_socket.on('camera preview', function (data) {
    //var width = data.width;
    //var height = data.height;
    var ctx = document.getElementById('previewCanvas_'+data.mac).getContext('2d');
    var img = new Image();
    img.src = 'data:image/jpeg;base64,' + data.image;
    console.log("camera preview",data);
    ctx.drawImage(img, 0, 0, 600, 400);
  });
  
  relay_socket.on('set location', function (data) {
    console.log("set location",data);
    var mac = data.mac;
    var mobile = $rootScope.mobile;
    for (var i = 0; i < mobile.length; i++) {
      if (mac === mobile[i].mac) {
        mobile[i].latitude = data.latitude;
        mobile[i].longitude = data.longitude;
        mobile[i].speed = data.speed;
        mobile[i].accuracy = data.accuracy;
      }
    }
    $rootScope.mobile = mobile;
    $rootScope.update_map(data);
  });

  //var camera_socket_connected = false;
  relay_socket.on('load settings', function (data) {
    load_settings(data);
    data.mode = 'preview';
    var data_obj = {mode:'preview', mac:data.mac, token:data.token}
    relay_socket.emit('get camera preview',data_obj);
    //console.log('load settings',data);
  });

  relay_socket.on('load devices', function (data) {
    //load_settings(data);
  });

  function load_settings(data) {
    var mac = data.mac;
    var devices = data.devices;
    var gateways = $rootScope.gateways;

    for (var i = 0; i < gateways.length; i++) {
      if (mac === gateways[i].mac) {
	var settings = data;
        //var cloud_url = 'http://'+settings.public_ip+':'+settings.port+'/'+settings.token+'/#/';
        settings.cloud_url = $sce.trustAsResourceUrl('http://'+settings.public_ip+':'+settings.port+'/'+settings.token+'/#/');
        gateways[i].settings = settings;

	key = 'thermostat';
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
        }
        $scope.$apply(function () {
          $rootScope.gateways[i].devices = devices;
        });
      }
    }

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