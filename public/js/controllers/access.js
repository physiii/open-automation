angular.module('starter.controllers')

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
