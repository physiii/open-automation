var app = angular.module('starter', ['socket-io'])

.controller('post_ctrl', function($scope, socket, $compile, $http) {
  var ws = io.connect();
  ws.on('router_array', function (data) {
    console.log(data);
              $scope.$apply(function () {
    $scope.router_list = data;
              });

  });
  $scope.set_wifi = function() {
    data = { router_name:$scope.router_name, router_password:$scope.router_password };
    ws.emit('set wifi',data);
    console.log("set_wifi",data);
  }
});
