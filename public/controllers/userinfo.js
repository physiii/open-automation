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
  /*var gateways = [];
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
  var smoke_alarms = [];*/
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

  var token = $.cookie('token'); //already done in login?
  var user = $.cookie('user');
  if (user == "null") user = null;
  if (token == "null") token = null;
  $rootScope.token = token;
  $rootScope.user = user;

  relay_socket.emit('link user',{token:token, user:user}); //already done in login?
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
        console.log(TAG,'getting settings',devices[i].mac);
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
    if (i < 0) return console.log("load_settings | device not found",data.mac);

    var attached_devices = data.devices;
    if (attached_devices) {
      for (var j = 0; j < attached_devices.length; j++) {
    	if (attached_devices[j].type == "camera") {
    console.log('load settings',data.mac);
          var device_id = $rootScope.find_index(devices,"id",attached_devices[j].id);
          if (device_id > -1) {
	    console.log(TAG,"device_id already exists",attached_devices[j]);
	    continue;
	  }

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
          console.log(TAG,data.mac,"added camera",attached_devices[j]);
          relay_socket.emit('get camera preview',{token:devices[i].token, camera_number:attached_devices[j].camera_number});
	}
	attached_devices[j].settings = devices[i].settings;
        $rootScope.devices.push(attached_devices[j]);
        //console.log(TAG,data.mac,"added device",attached_devices[j]);
      }
    }
    $scope.$apply(function () {
      $rootScope.devices[i].settings = data;
    });
  });



  



  //$rootScope.login_message = "init";
  /*$scope.login = function(user) {
    $.post( "/login",user).success(function(data){
      console.log("login!",data);
      if (data.error) {
        console.log("error",data.error);
        return;
      }
      $.cookie('user',data.user, { path: '/' });
      $.cookie('token',data.token, { path: '/' });

      relay_socket.emit('link user',{token:token, user:user});
      relay_socket.emit('get devices',{token:token});
      relay_socket.emit('get contacts',{user_token:token});
      window.location.replace("#/dashboard");
    }).fail(function(data) {
    //document.getElementById("login_message").style.display = "inline";
    $scope.$apply(function () {
      $rootScope.login_message = "Invalid username/password";
    });
    console.log( "error: ",data );
  });
  }*/

 /*$scope.login = function(user) {
    console.log("loging in, " + user);
    $.post( "/login",user).success(function(data){
      console.log("login!",data);
      $scope.close();
      if (data.error) {
        console.log("error",data.error);
        return;
      }
      $.cookie('user',data.user, { path: '/' });
      $.cookie('token',data.token, { path: '/' });

      var token = $.cookie('token');
      var user = $.cookie('user');
      if (user == "null") user = null;
      if (token == "null") token = null;
      $rootScope.token = token;
      $rootScope.user = user;
      relay_socket.emit('link user',{token:token, user:user});
      relay_socket.emit('get devices',{token:token});
      relay_socket.emit('get contacts',{user_token:token});

      window.location.replace("#/dashboard");
    }).fail(function(data) {
    //document.getElementById("login_message").style.display = "inline";
    $scope.$apply(function () {
      $scope.login_message = "Invalid username/password";
    });
    console.log( "error: ",data );
  });
  }*/

  $rootScope.logout = function() {
    $rootScope.token = null;
    $rootScope.user = null;
    token = null;
    user = null;
    $.cookie('token', null, { path: '/' });
    $.cookie('user', null, { path: '/' });
    //$.cookie("name", null, { path: '/' });
    relay_socket.emit('user logout', {token:token});
    window.location.replace("/");
    console.log('logout',user);
  }

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

