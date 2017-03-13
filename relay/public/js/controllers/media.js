angular.module('starter.controllers')

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
