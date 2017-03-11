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
		    mac:$rootScope.gateways[i].mac,
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
}
