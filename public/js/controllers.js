angular.module('main_site', ['socket-io'])
.controller('index', function($scope,$rootScope) {
  $scope.show_form = function(form) {
    document.getElementById(form).style.display = "inline";
    document.getElementById(form + "_btn").style.display = "none";
  }
  
  $scope.login = function(user) {
    console.log(user);
    $.post( "/login",user).success(function(data){
      $.cookie('user',data.user);
      $.cookie('token',data.token, { expires : 5 });
      console.log("login",data);
      window.location.replace("/home");
    });
  }
  
  $scope.show_login = function() {
    document.getElementById("contact_form").style.display = "none";
    document.getElementById("main_login_form").style.display = "inline";
    document.getElementById("main_register_form").style.display = "none";
  }
  
  $scope.show_register = function() {
    document.getElementById("contact_form").style.display = "none";
    document.getElementById("main_login_form").style.display = "none";
    document.getElementById("main_register_form").style.display = "inline";
  }
  
  $scope.register = function(user) {
    $.post( "/register",user).success(function(data){
      if (data.error) {
        console.log("error",data.error);
        return;
      }
      console.log("register",data);
      $.cookie('user',data.username);
      $.cookie('token',data.token, { expires : 5 });
      window.location.replace("/home");
    });
  }
});






angular.module('starter.controllers', ['socket-io'])

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

  console.log("<< ------  userinfo  ------ >> ");
  var relay_socket = io.connect('http://24.253.223.242:5000');
  $rootScope.relay_socket = relay_socket;
  var token = $.cookie('token');
  var user = $.cookie('user');
  $rootScope.token = token;
  console.log($rootScope.token);
  relay_socket.emit('link user',{token:token, user:user});
  relay_socket.emit('get devices',{token:token});
  relay_socket.emit('get contacts',{user_token:token});
  //relay_socket.emit('get devices',data);
  //relay_socket.emit('get contacts',{user_token:$rootScope.token});
  //$rootScope.username = username;
  $.getJSON("http://ipinfo.io", function (data) {
    var lat = data.loc.substring(0,7);
    var lng = data.loc.substring(8,16);
    $rootScope.ipLatitude = lat;
    $rootScope.ipLongitude = lng;    
    url = "http://forecast.io/embed/#lat="+lat+"&lon="+lng+"&name=" + data.city;
    $('#forecast_embed').attr('src', url);  
    $scope.ipAddress = data.ip;
    $scope.postal = data.postal;
    $rootScope.postal = data.postal;
    //$rootScope.initialize_map();
  });
  $rootScope.alert_contacts = [];

  //relay_socket.emit('get user token',{mac:$rootScope.username,user:$rootScope.username});
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

  relay_socket.on('ssh_out', function (data) {
    ssh_out = data.stdout;
    var index = $rootScope.find_index($rootScope.gateways,'token',data.token);
    $scope.$apply(function () {
      $rootScope.gateways[index].ssh_out = ssh_out;
    });
    console.log("ssh_out",ssh_out);
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

  relay_socket.on('get token', function (data) {
    $rootScope.token = data.token;
    console.log(data.token);
    relay_socket.emit('get devices',data);
    data.mode = "start";
    relay_socket.emit('get contacts',{user_token:$rootScope.token});
  });

  relay_socket.on('get contacts', function (data) {
    $rootScope.alert_contacts = data.contacts;
    console.log(data);
  });

  relay_socket.on('get devices', function (data) {
    var devices = data.devices;
    var alarm_mode = "init";
    console.log('get devices',devices);
    for(var i = 0; i < devices.length; i++) {
      if (!devices[i].device_type) continue;
      for (var j=0; j < devices[i].device_type.length; j++) {

      if (devices[i].device_type[j] == "gateway") {
        var command = devices[i];
        command.mode = "start";
        devices[i].stream_started = 0;
        relay_socket.emit('ffmpeg',command);
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
    relay_socket.emit('get settings',{token:$rootScope.token});
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

  relay_socket.on('from_mobile', function (data) {
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
    for (var i = 0; i < gateways.length; i++) {
      if (gateways[i].stream_started > 3) {
        console.log('stream already started',gateways[i].stream_started);
        continue;
      }
      gateways[i].camera_socket = new WebSocket( 'ws://24.253.223.242:8084' );
      gateways[i].canvas = document.getElementById('videoCanvas_'+gateways[i].mac);
      gateways[i].player = new jsmpeg(gateways[i].camera_socket, {canvas:gateways[i].canvas,token:gateways[i].token});
      console.log('token for video stream',gateways[i].token);
      gateways[i].stream_started++;
    }
    console.log('load settings',data);
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

  $rootScope.to_mobile = function(command,token) {
    console.log('to_mobile',command);
    relay_socket.emit('to_mobile', {token:token, command:command});
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

.controller('DashCtrl', function($scope, $ionicLoading, $compile, $http) { 




})

.controller('DeviceCtrl', function($scope, $stateParams, Categories, socket, $ionicLoading, $compile, $http) {
  $scope.chat = Categories.get($stateParams.chatId);
})

.controller('AccessCtrl', function($scope, $rootScope, $stateParams, Categories, socket, $ionicLoading, $compile, $http) {
  $scope.chat = Categories.get($stateParams.chatId);
  console.log('<< ------  AccessCtrl  ------ >>');
  var relay_socket = $rootScope.relay_socket;
  relay_socket.on('garage_opener', function (data) {
    console.log("garage_opener",data);
    garage_openers = $scope.garage_openers;
    for(var i = 0; i < garage_openers.length; i++) {
      if (garage_openers[i].token === data.token) {
        if (data.distance > 30) {
          document.getElementById(garage_openers[i].mac+"_screen").style.background = "#9C0C1B";
          garage_openers[i].current_state = "CLOSED";      
          document.getElementById(garage_openers[i].mac+"_lock").style.display = "inline";
          document.getElementById(garage_openers[i].mac+"_unlock").style.display = "none";
          document.getElementById(garage_openers[i].mac+"_loading").style.display = "none";          
        } else {
          document.getElementById(garage_openers[i].mac+"_screen").style.background = "#0B7520";
          document.getElementById(garage_openers[i].mac+"_lock").style.display = "none";
          document.getElementById(garage_openers[i].mac+"_unlock").style.display = "inline";
          document.getElementById(garage_openers[i].mac+"_loading").style.display = "none";
          garage_openers[i].current_state = "OPEN";
        }   
        garage_openers[i].state = data;
        //console.log(garage_openers[i].mac + " | " + garage_openers[i].state.distance);
        //$scope.$apply(function () {
          $scope.garage_openers = garage_openers;
        //});
      }
    }
  });
  var devices = $rootScope.devices;
  var garage_openers = $rootScope.garage_openers;
  var gateways = $rootScope.gateways;
  var length = -1;
  if (garage_openers) {
    length = garage_openers.length;
  } else {
    console.log("no garage openers found");
  }
  for(var i = 0; i < length; i++) {
    relay_socket.emit('garage_opener', { token:garage_openers[i].token, mac:garage_openers[i].mac, command:"ping" });
  }  


  $scope.arm_system = function(mode) {
    var device_list = [];
    var gateways = $rootScope.gateways;
    var room_sensors = $rootScope.room_sensors;
    for(var i = 0; i < gateways.length; i++) {
      device_list.push(gateways[i].token);
    }
    for(var i = 0; i < room_sensors.length; i++) {
      device_list.push(room_sensors[i].token);
    }
    var group_obj = {group_id:$rootScope.token, device_type:['alarm'], mode:mode, members:device_list};
    relay_socket.emit('set alarm',group_obj);
    console.log("arm_system",mode);
  }

  $scope.lock = function(device,gateway) {
    relay_socket.emit('set zwave',{token:gateway.token, node_id:device.id, class_id:98, instance:1, index:0, value:true});
    console.log("lock",device);
  }

  $scope.unlock = function(device,gateway) {
    relay_socket.emit('set zwave',{token:gateway.token, node_id:device.id, class_id:98, instance:1, index:0, value:false});
    console.log("unlock",device);
  }

  $scope.close = function(mac) {
    for(var i = 0; i < garage_openers.length; i++) {
      if (garage_openers[i].mac === mac) {
        relay_socket.emit('garage_opener',{command:"close",token:garage_openers[i].token});
      }
    }
    console.log("CLOSE");
  }


  $scope.open = function(mac) {
    for(var i = 0; i < garage_openers.length; i++) {
      if (garage_openers[i].mac === mac) {
        relay_socket.emit('garage_opener',{command:"open",token:garage_openers[i].token});
      }
    }
    console.log("OPEN");
  }
})

.controller('LightsCtrl', function($scope, $rootScope, $stateParams, Categories, socket,$ionicLoading, $compile, $http) {
  console.log('<< ------  LightsCtrl  ------ >>');
  var relay_socket = $rootScope.relay_socket;
  
//--------------------------------------------//

          $( "#draggable" ).draggable();
          $( "#droppable" ).droppable({
            drop: function( event, ui ) {
              $( this )
                .addClass( "ui-state-highlight" )
                .find( "p" )
                  .html( "Dropped!" );
            }
          }); 



var image = new Image(200,200);
image.src = 'images/sample.png';
image.addEventListener('load', function() {
    var vibrant = new Vibrant(img);
    var swatches = vibrant.swatches()
    for (var swatch in swatches)
        if (swatches.hasOwnProperty(swatch) && swatches[swatch])
            console.log(swatch, swatches[swatch].getHex())

    /*
     * Results into:
     * Vibrant #7a4426
     * Muted #7b9eae
     * DarkVibrant #348945
     * DarkMuted #141414
     * LightVibrant #f3ccb4
     */
});

/*new Vibrant(
    image,
    64, //amount of colors in initial palette from which the swatches will be generated, defaults to 64
    5 //quality. 0 is highest, but takes way more processing. defaults to 5.
)*/
  
  relay_socket.on('gateway', function (data) {
    var _mac = data.mac;
    var _magnitude = data.magnitude;
    console.log( _mac + " | gateway data " + _magnitude);
  });
  
  var lights = [];
  relay_socket.on('device_info', function (data) {
    lights = [];
    var light_obj = {};  
    for (var i = 0; i < data.lights.length; i++) {
      light_obj = data.lights[i];
      light_obj['mac'] = data.mac;
      light_obj['token'] = data.token;
      light_obj['selected'] = true;
      lights.push( light_obj );
      //console.log( "received device_info --> " + JSON.stringify(data));
      //console.log( "<<-- lights array --->> " + light_obj.mac );
    }
    $scope.$apply(function () {
      $scope.lights = lights;
    });
    //console.log( "received device_info --> " + JSON.stringify(lights));
  }); 

  $scope.all_lights = function(state,value) {
    var rgb = [];
    var set_state = {};
    if (state === 'slider') {
      set_state.bri = $scope.slider_value;
    }
    if (state === 'warm') {
      set_state.on = true;
      set_state.ct = 500;
    }
    if (state === 'off') {
      set_state.on = false;
    }
    if (state === 'red') {
      set_state.on = true;    
      set_state.rgb = [255, 0, 0];
    }
    if (state === 'white') {
      set_state.on = true;
      set_state.rgb = [255, 255, 255];
    }
    if (state === 'blue') {
      set_state.on = true;
      set_state.rgb = [0, 0, 255];
    }
    if (state === 'green') {
      set_state.on = true;
      set_state.rgb = [0, 255, 0];
    }
    if (state === 'orange') {
      set_state.on = true;
      set_state.rgb = [255, 165, 0];
    }
    if (state === 'purple') {
      set_state.on = true;
      set_state.rgb = [128, 0, 128];    
    }
    if (state === 'magenta') {
      set_state.on = true;
      set_state.rgb = [255, 0, 255];    
    }
    for (var i = 0; i < $rootScope.gateways.length; i++) {
      for (var j = "id" in $rootScope.gateways[i].devices) {
	if ($rootScope.gateways[i].devices[j].device_type == "lights") {
        for (var k = 0; k < $rootScope.gateways[i].devices[j].lights.length; k++) {
          $rootScope.gateways[i].devices[j].lights[k].state = set_state;
          light = { 
		    device:$rootScope.gateways[i].devices[j],
 		    light:$rootScope.gateways[i].devices[j].lights[k],
		    token:$rootScope.gateways[i].token
		  };
          console.log("all_lights",$rootScope.gateways[i].devices[j].lights[k]);
          relay_socket.emit('set lights',light);
	}
	}
      }
    }
  }

  
  $scope.showInfo = function(mac_addr) { 
    //console.log("info " + mac_addr);
    if (document.getElementById(mac_addr+"_lights_info").style.display == "inline") {
      document.getElementById(mac_addr+"_lights_info").style.display = "none";
    } else {
      document.getElementById(mac_addr+"_lights_info").style.display = "inline";    
    }
  }

  $scope.removeDevice = function(mac_addr) {   
    console.log("removing " + mac_addr);
    document.getElementById(mac_addr+"_div").style.display = "none";
    $.post( "php/remove_device.php",{ user:$rootScope.username, mac:mac_addr }).success(function(data){
      console.log(mac_addr + " username removed, remove_device.php | " + data);
    });
  }
  
  $scope.show_gateway_form = function() {
    document.getElementById("gateway_form").style.display = "inline";
    document.getElementById("gateway_form_btn").style.display = "none";
  }

//--------------------------------------------//
})

.controller('VideoCtrl', function($scope, $rootScope, $stateParams, socket, $ionicLoading, $compile, $http) {
  console.log("<< ------  VideoCtrl  ------ >> ");
  $scope.fullscreen = function(div_id) { 
    console.log("fullscreen",div_id);
    if (document.getElementById(div_id).className == "") {
      document.getElementById(div_id).className = "col-lg-4 col-md-6 col-sm-12";
    } else document.getElementById(div_id).className = "";
  }
})

.controller('ClimateCtrl', function($scope, $rootScope, $stateParams, Categories, socket, $ionicLoading, $compile, $http) {

  console.log('<< ------- ClimateCtrl ------- >>');
  var relay_socket = $rootScope.relay_socket;

$scope.chartOptions = {
  chart: {
    renderTo: 'thermostat_schedule_container',
    animation: false
  },
  title: {text: '' },
  plotOptions: {
    series: {
      point: {
        events: {
          drag: function (e) { 
            $('#drag').html(
              'Dragging <b>' + this.series.name + '</b>, <b>' + this.category + '</b> to <b>' + Highcharts.numberFormat(e.y, 2) + '</b>');
            },
            drop: function (e) {

  for (var i = 0; i < devices.length; i++ ) {
    if ( devices[i].device_type === "thermostat" ) {
      var device = devices[i];
      var new_schedule = { device_type:device.device_type, local_ip:device.local_ip, token:device.token, time:this.category, temperature:Highcharts.numberFormat(e.y, 2) }
      relay_socket.emit('store_schedule',new_schedule);
console.log(new_schedule);
    }
  }  

              $('#drop').html(
              'In <b>' + this.series.name + '</b>, <b>' + this.category + '</b> was set to <b>' + Highcharts.numberFormat(this.y, 2) + '</b>');
            }
          }
        },
      stickyTracking: false
    },
    column: {stacking: 'normal'},
    line: {cursor: 'ns-resize'},    
    },
    xAxis: {
      categories: ['7 AM','9 AM','11 AM','1 PM','3 PM','5 PM','7 PM','9 PM','11 PM','1 AM','3 AM','5 AM'],
      type: 'datetime',
      title: {
      text: 'Time'
    }
  },
  yAxis: {
    title: {
      text: 'Temperature (°F)'
    },
      min: 60,max: 80
  },
  tooltip: {
    formatter: function() {
      return '<b>'+ this.series.name +'</b><br/>'+
      this.x +': '+ Math.round(this.y) +'°F';
    }
  },  
  series: [{
    name: 'set temperature',
    data: [68, 71, 73, 75, 74, 72, 70, 71, 71, 69, 68, 70],
    draggableY: true
  }]
};

  $scope.set_thermostat = function(command, device, gateway) {
  console.log("set_thermostat",command);
  //disable_update();
  if (!device.set_state) device.set_state = device.current_state;
  if (command === 'temp_down') {
    if (device.set_state.t_heat) {
      device.set_state.t_heat = Number(device.set_state.t_heat) - 1;
      device.set_state.set_temp = device.set_state.t_heat;
    }
    if (device.set_state.t_cool) {
      device.set_state.t_cool = Number(device.set_state.t_cool) - 1;
      device.set_state.set_temp = device.set_state.t_cool;
    }
  }
  if (command === 'temp_up') {
    if (device.set_state.t_heat) {
      device.set_state.t_heat = Number(device.set_state.t_heat) + 1;
      device.set_state.set_temp = device.set_state.t_heat;
    }
    if (device.set_state.t_cool) {
      device.set_state.t_cool = Number(device.set_state.t_cool) + 1;
      device.set_state.set_temp = device.set_state.t_cool;
    }
  }
  if (command === 'cool') { 
    device.current_state.tmode = 2;
    set_state.tmode = 2;
    set_state.t_cool = Number(device.current_state.t_heat);    
    device.state.mode = "cool";
    device.state.set_state = set_state;
    delete device.state.set_state.t_heat;
  }
  if (command === 'warm') {
    device.current_state.tmode = 1;
    set_state.tmode = 1;
    set_state.t_heat = Number(device.current_state.t_cool);
    device.state.mode = "heat";
    device.state.set_state = set_state;
    delete device.state.set_state.t_cool;      
  }
  if (command === 'power') { 
    device.current_state.tmode = 0;
    set_state.tmode = 0;
    device.state.mode = "off";
    device.state.set_temp = "OF";
    device.state.set_state = set_state;
    delete device.state.set_state.t_heat;
    delete device.state.set_state.t_cool;     
  }
  if (command === 'fan') {
    if (device.state.fan === "on") {
      device.current_state.fmode = 2;
      set_state.fmode = 2;
      device.state.fan = "off";
      device.state.set_state = set_state;
    }
    if (device.state.fan === "off") {
      device.current_state.fmode = 1;
      set_state.fmode = 1;
      device.state.fan = "on";      
      device.state.set_state = set_state;
    }
  }
  device.set_state.hold = 1;
  relay_socket.emit('set_thermostat',device);

  var gateways = $rootScope.gateways;
  for (var i = 0; i < gateways.length; i++) {
    if (gateways[i].devices) {
      for (var j = 0; j < gateways[i].devices.length; j++) {
        if (gateways[i].devices[j]._id === device._id) {
          $rootScope.gateways[i].devices[j] = device;
          console.log('!! HIT !!',device);
    	    $rootScope.gateways = gateways;
            console.log('HIT HIT',gateways);
        }
      }
    }
  }
}

/*
therm_paused = false;
update_enabled = true;

function disable_update() {
  if (update_enabled) {
    update_enabled = false;
    setTimeout(function () {  
      update_enabled = true;
    }, 5000);    
  }
}
*/

})


.controller('AccountCtrl', function($scope, $rootScope, $stateParams, Categories, socket,$ionicLoading, $compile, $http) {

  console.log('<< ------  AccountCtrl  ------ >>');
  var relay_socket = $rootScope.relay_socket;
  var alert_contacts = $rootScope.alert_contacts;
  $scope.link_lights = function(gateway) {
    relay_socket.emit('link lights',{ mac:gateway.mac, token:gateway.token });
    console.log('link lights',gateway);
  }

  $scope.light_command = function(gateway,device,light) {
    console.log("light_command",light);
    light = {device:device, light:light, token:gateway.token};
    relay_socket.emit('lights',light);
  }

  $scope.ssh = function(gateway) {
    ssh_obj = {token:gateway.token, command:gateway.command}
    console.log("connect_ssh",gateway);
    relay_socket.emit('ssh',gateway);
  }

  $scope.add_zwave_device = function(gateway) {
    relay_socket.emit('add_zwave_device',gateway);
    console.log('add_zwave_device');
  }
  
  $scope.show_div = function(div_id) { 
    console.log(div_id);
    document.getElementById(div_id + "_div").style.display = "inline";    
  }

  $scope.showInfo = function(mac_addr) { 
    //console.log("info " + mac_addr);
    if (document.getElementById(mac_addr+"_account_info").style.display == "inline") {
      document.getElementById(mac_addr+"_account_info").style.display = "none";
    } else {
      document.getElementById(mac_addr+"_account_info").style.display = "inline";    
    }
  }
  


  $scope.update_device = function(device) {
    console.log("update_device",device);
    relay_socket.emit('update',device);
  }

  $scope.show_rename_device = function(device,value) {
    if (value == true) {
      document.getElementById(device.mac+"_rename_device").style.display = "inline";
      document.getElementById(device.mac+"_show_rename_device").style.display = "none";
    } else {
      document.getElementById(device.mac+"_rename_device").style.display = "none";
      document.getElementById(device.mac+"_show_rename_device").style.display = "inline";
    }    
    console.log("show_rename_device",value);  
  }

  $scope.rename_device = function(device) {
    $scope.show_rename_device(device,false);
    console.log("rename_device",device);
    device_obj = { token:device.token,
                   device_name:device.device_name };
    relay_socket.emit('rename device',device_obj);
  }

  $scope.remove_device = function(device) {
    device.user_token = $rootScope.token;
    console.log("unlink_device",device);  
    relay_socket.emit('unlink device',device);
  }


  $scope.add_thermostat = function(device) {
    console.log("add_thermostat",device);  
    relay_socket.emit('add thermostat',device);
  }


  $scope.add_device = function(device) {
    device.user_token = $rootScope.token;
    console.log("add_device",device);  
    relay_socket.emit('link device',device);

    /*if (device.device_type === "garage_opener") {
        $.post( "php/add_device.php",{ device_type:device.device_type, user:$rootScope.username, mac:device.mac, device_name:device.device_name }).success(function(data){
          console.log("add_device.php ",data);
          device_obj = JSON.parse(data);
          //$scope.$apply(function () {
            $rootScope.garage_openers.push( device_obj );
          //});
        });
    }

    if (device.device_type === "room_sensor") {
        $.post( "php/add_device.php",{ device_type:device.device_type, user:$rootScope.username, mac:device.mac, device_name:device.device_name }).success(function(data){
          console.log("add_device.php ",data);
          device_obj = JSON.parse(data);
          $scope.$apply(function () {
            $rootScope.room_sensors.push( device_obj );
          });
        });
    }

    if (device.device_type === "media_controller") {
        $.post( "php/add_device.php",{ device_type:device.device_type, user:$rootScope.username, mac:device.mac, device_name:device.device_name }).success(function(data){
          console.log("add_device.php ",data);
          device_obj = JSON.parse(data);
          $scope.$apply(function () {
            $rootScope.media_controllers.push( device_obj );
          });
        });
    }

    if (device.device_type === "siren") {
        $.post( "php/add_device.php",{ device_type:device.device_type, user:$rootScope.username, mac:device.mac, device_name:device.device_name }).success(function(data){
          console.log("add_device.php ",data);
          device_obj = JSON.parse(data);
          $scope.$apply(function () {
            $rootScope.sirens.push( device_obj );
          });
        });
    }

    if (device.device_type === "thermostat") {
      console.log('thermostat | ' + device.ip);
      relay_socket.emit('add thermostat',{ mac:device.mac, token:device.token, local_ip:device.local_ip, device_name:device.device_name });
      return;
    }

    if (device.device_type === "gateway") 
    {
        var device_obj = { device_type:device.device_type, user:$rootScope.username, mac:device.mac, device_name:device.device_name };
        $.post( "php/add_device.php",device_obj).success(function(data){console.log(data);
          data = JSON.parse(data);
          device_obj.public_ip = data.public_ip;
          device_obj.local_ip = data.local_ip;
          device_obj.port = data.port;
          device_obj.token = data.token;
          console.log("device_obj | " + device_obj.token);
          $scope.$apply(function () {
            $scope.gateways.push( device_obj );
          });
        }); 
    }*/
  }  
  $scope.show_form = function(form) {
    //console.log("FORM: " + form);
    document.getElementById(form).style.display = "inline";
    document.getElementById(form + "_btn").style.display = "none";
  }

  $scope.test_alert = function(contact) {
    subject = "Test Alert!";
    message = "Test alert sent on " + Date.now() + " by " + $rootScope.username;
    console.log("sending test alert to " + contact.number);
  }
  
  $scope.toggle_setting = function(setting) {
   //delete settings["$$hashKey"];
   console.log("setting_obj | ", setting);
   relay_socket.emit('set settings', setting);
  }

  $scope.add_contact = function(contact) {
   contact.user_token = $rootScope.token;
   relay_socket.emit('add contact', contact);
   console.log("add_contact | ", contact);
  }
  
  $scope.remove_contact = function(contact) {
    $.post( "php/remove_alert_contact.php",{user:$rootScope.username, number:contact.number, label:contact.label}).success(function(data){
      console.log("remove_alert_contact.php | " + data);
      alert_contacts = $rootScope.alert_contacts;
      console.log("before: " + alert_contacts);
      for (i = 0; i < alert_contacts.length; i++) {
        if (alert_contacts[i].number == contact.number) {
          $scope.$apply(function () {
            $rootScope.alert_contacts.splice(i,1);
          });   
        }
      }
      console.log("after: " + alert_contacts);      
    });
  }

})

.controller('AlertsCtrl', function($rootScope, $scope, $stateParams, Categories, socket, $ionicLoading, $compile, $http) {
  console.log('<< ------  AlertsCtrl  ------ >>');
  //var relay_socket = io.connect('http://68.12.126.213:5000');
  var relay_socket = $rootScope.relay_socket;
  relay_socket.on('siren', function (data) {
    console.log("siren",data);
    sirens = $rootScope.sirens;
    for(var i = 0; i < sirens.length; i++) {
      if (sirens[i].token === data.token) {  
        sirens[i].state = data;
        $scope.$apply(function () {
  	  $rootScope.sirens = sirens;
        });
      }
    }
  });  
})

.controller('MediaCtrl', function($rootScope, $scope, $stateParams, Categories, socket, $ionicLoading, $compile, $http) {
  console.log("<< -------  MediaCtrl  ------- >>");
  //$scope.chat = Categories.get($stateParams.chatId);
  //var relay_socket = io.connect('http://68.12.126.213:5000');
  var relay_socket = $rootScope.relay_socket;
  var devices = $rootScope.devices;
  var gateways = $rootScope.gateways;
  $scope.gateways = gateways;
  $scope.room_sensor_rec = function(command,device) {
    if (device.clear) {
      console.log("CLEAR SOME CODES!")
      relay_socket.emit('room_sensor_clear',{ command:command, token:device.token });
      device.clear = false;
    } else {
      relay_socket.emit('room_sensor_rec',{ command:command, token:device.token });
      console.log('record ' + command + ' to ' + device.device_name);
    }
  }

  $scope.room_sensor_clear = function(device) {
    //relay_socket.emit('room_sensor',{ command:command, token:device.token });
    device.clear = true;
    console.log('clear codes on ' + device.mac);
  }

  $scope.room_sensor = function(command,device) {
    relay_socket.emit('room_sensor',{ command:command, token:device.token });
    console.log('send ' + command + ' to ' + device.device_name);
  }

  var length = -1;
  if (devices) {
    length = devices.length;
  }
  for(var i = 0, j = 0; i < length; i++) {
    if (devices[i].device_type === "gateway" || devices[i].device_type === "gateway/camera") {
      gateways[j] = devices[i];
      relay_socket.emit('link_gateway', { token:gateways[j].token });
      //console.log("linking gateway " + gateways[j].token);
      j++;
    }
  }
  $scope.gateways = gateways;
  $scope.media = function(command,device,option) {
    relay_socket.emit('media', { token:device.token, cmd:command });  
  }
  $scope.media_dash = function(command,option) {
    var devices = $rootScope.devices;
    var length = -1;
    if (devices) {
      length = devices.length;
    }    
    for (var i = 0; i < length; i++) {
      var device = devices[i];
      relay_socket.emit('media', { token:device.token, cmd:command });
    }
  }    
})

.controller('CategoriesCtrl', function($scope, Categories) {
  $scope.categories = Categories.all();
  $scope.remove = function(chat) {
    Categories.remove(chat);
  };
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, Categories) {
  $scope.chat = Categories.get($stateParams.chatId);
})

.controller('HealthCtrl', function($scope, $ionicLoading, $compile, $http) { 
  console.log("<----- HealthCtrl ----->");
})


.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $compile) {
  console.log("<----- MapCtrl ----->");
  var myLatlng = new google.maps.LatLng($rootScope.ipLatitude,$rootScope.ipLongitude);
  var mapOptions = {
    center: myLatlng,
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  $rootScope.map = new google.maps.Map(document.getElementById("map"),mapOptions);
  var markers = [];

  $rootScope.initialize_map = function () {
    var myLatlng = new google.maps.LatLng($rootScope.ipLatitude,$rootScope.ipLongitude);
    var marker = new google.maps.Marker({    
        position: myLatlng,
        map: $rootScope.map
      });
    var mapOptions = {
      center: new google.maps.LatLng($rootScope.ipLatitude, $rootScope.ipLongitude),  
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $rootScope.map = new google.maps.Map(document.getElementById("map"),mapOptions);
    marker.setMap($rootScope.map);
    console.log("<----- initialize_map -----> Lat: ",$rootScope.ipLatitude);
  }

  $rootScope.update_map = function (device) {
    mobile = $rootScope.mobile;
    device_str = JSON.stringify(device);
    //console.log("!!device!!",device_str);
    Latlng = new google.maps.LatLng(device.latitude, device.longitude);
    var contentString = "<div>" + device.mac + "<br>";
        contentString += "<a ng-click=\"to_mobile('ping_audio_start','"+device.token+"')\">Start Ping</a>    |    ";
        contentString += "<a ng-click=\"to_mobile('ping_audio_stop','"+device.token+"')\">Stop Ping</a></div>";
    var compiled = $compile(contentString)($scope);
    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });      
    var marker = new google.maps.Marker({
      position: Latlng,
      title: device.mac,
      map: $rootScope.map
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
    
    for (var i = 0; i < markers.length; i++) {
      var title = markers[i].getTitle();
      if (title === device.mac) {
        markers[i].setMap(null);
      }
    }
    markers.push(marker);
  }
})

            // Directive for generic chart, pass in chart options
            .directive('hcChart', function () {
                return {
                    restrict: 'E',
                    template: '<div></div>',
                    scope: {
                        options: '='
                    },
                    link: function (scope, element) {
                        Highcharts.chart(element[0], scope.options);
                    }
                };
            })
            // Directive for pie charts, pass in title and data only    
            .directive('hcPieChart', function () {
                return {
                    restrict: 'E',
                    template: '<div></div>',
                    scope: {
                        title: '@',
                        data: '='
                    },
                    link: function (scope, element) {
                        Highcharts.chart(element[0], {
                            chart: {
                                type: 'pie'
                            },
                            title: {
                                text: scope.title
                            },
                            plotOptions: {
                                pie: {
                                    allowPointSelect: true,
                                    cursor: 'pointer',
                                    dataLabels: {
                                        enabled: true,
                                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                                    }
                                }
                            },
                            series: [{
                                data: scope.data
                            }]
                        });
                    }
                };
            })
            .controller('myController', function ($scope) {
                
            });

function post_enabler() {
  $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';  
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
    for(name in obj) {
      value = obj[name];
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
    return query.length ? query.substr(0, query.length - 1) : query;
  };
  $http.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }]; 
}


