angular.module('open-automation')
.controller('RegulatorCtrl', function($scope, $rootScope, socket, $compile, $http) {
  console.log("<< ------  RegulatorCtrl  ------ >> ");
  var TAG = "[regulator]";
  var relay_socket = $rootScope.relay_socket;
  var regulators = $rootScope.regulators;
  
  // ------------- //
  // sockets calls //
  // ------------- //
  relay_socket.on('regulator power', function (data) {
    console.log(TAG, "regulator power", data);
    var devices = $rootScope.devices;
    var index = $rootScope.find_index(devices,'token',data.token);
    $scope.$apply(function () {
      $rootScope.devices[index].power = data;
    });
  });

  relay_socket.on('regulator climate', function (data) {
    console.log(TAG, "regulator climate", data);
    var devices = $rootScope.devices;
    var index = $rootScope.find_index(devices,'token',data.token);
    $scope.$apply(function () {
      $rootScope.devices[index].climate = data;
    });
  });

  // ------------------- //
  // regulator functions //
  // ------------------- //

  //get_camera_list();
  /*function get_camera_list() {
    var gateways = $rootScope.gateways;
    //if (!gateways) return console.log(TAG,"get_camera_list",gateways);
    for (var i = 0; i < gateways.length; i++) {
      if (gateways[i].getting_camera_list) return console.log(TAG,"preview already requested");
      relay_socket.emit('get camera list',gateways[i]);
      gateways[i].getting_camera_list = true;
      console.log(TAG,"get camera list",gateways[i].mac)
    }
  }*/

  /*$scope.set_low_battery = function(device) {
    var
    for (var setting in device.settings) {
      if (setting == "new_low_battery_off") {
        relay_socket.emit('regulator',command);
      }

      if (setting > 0) {
      }
    }
    console.log(TAG,device.mac,'set_low_battery',device.settings.low_battery);
  }*/

  $scope.set = function(device) {
    var command = {settings:device.settings, token:device.token}
    relay_socket.emit('regulator',command);
    console.log(TAG,device.mac,command);
  }

})
