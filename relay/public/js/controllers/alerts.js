angular.module('starter.controllers')

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
