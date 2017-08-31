angular.module('starter.controllers')
.controller('RoomCtrl', function($scope, $rootScope, $stateParams, socket, $ionicLoading, $compile, $http) {
  console.log("<< ------  RoomCtrl  ------ >> ");
  var TAG = "[room_controller]";
  var stream_port = "8084";
  var relay_socket = $rootScope.relay_socket;
  var gateways = $rootScope.gateways;
  $scope.flip_card = false;
  // ------------- //
  // sockets calls //
  // ------------- //
  var motion_timeout;
  relay_socket.on('room_sensor', function (data) {
    var index = $rootScope.find_index($rootScope.room_sensors,'token',data.token);
    if (index < 0) return console.log("room_sensor not found",data.token);
    $scope.$apply(function () {
      $rootScope.room_sensors[index].message = data.message;
      $rootScope.room_sensors[index].background_color = "#9C0C1B";
      clearTimeout(motion_timeout);
    });

    motion_timeout = setTimeout(function () {
      $scope.$apply(function () {
        $rootScope.room_sensors[index].message = "No Motion";
        $rootScope.room_sensors[index].background_color = "#222";
      });
    },5000);

    //console.log(TAG,data);
  });

  /*relay_socket.on('room_sensor', function (data) {
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
  });*/

  // --------------------- //
  // room sensor functions //
  // --------------------- //
  $scope.room_sensor = function(command, room_sensor) {
    var command = {token:room_sensor.token, command:command}
    relay_socket.emit('room_sensor',command);
    console.log(TAG,'command',command);
  }
})
