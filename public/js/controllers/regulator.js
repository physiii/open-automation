angular.module('starter.controllers')
.controller('RegulatorCtrl', function($scope, $rootScope, $stateParams, socket, $ionicLoading, $compile, $http) {
  console.log("<< ------  RegulatorCtrl  ------ >> ");
  var TAG = "[regulator]";
  var relay_socket = $rootScope.relay_socket;
  var regulators = $rootScope.regulators;
  
  // ------------- //
  // sockets calls //
  // ------------- //
  relay_socket.on('regulator power', function (data) {
    console.log(TAG, "regulator power", data);
    var index = $rootScope.find_index($rootScope.regulators,'token',data.token);
    $scope.$apply(function () {
      $rootScope.regulators[index].power = data;
    });
  });

  relay_socket.on('regulator climate', function (data) {
    console.log(TAG, "regulator climate", data);
    var index = $rootScope.find_index($rootScope.regulators,'token',data.token);
    $scope.$apply(function () {
      $rootScope.regulators[index].climate = data;
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

  $scope.regulator = function(command, regulator) {
    var command = {token:regulator.token, command:command}
    relay_socket.emit('regulator',command);
    console.log(TAG,'command',command);
  }

})
