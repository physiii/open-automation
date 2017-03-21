angular.module('starter.controllers')

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
})
