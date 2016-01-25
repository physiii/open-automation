var app = angular.module('starter', ['ionic'])

.controller('tokenCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {


})

.controller('post_ctrl', function($scope,$http) {
///////////////////////////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////////
  var ws = io.connect('http://192.168.0.18:3000/');
  $scope.token_request = function(command) {
    data = {'user':$scope.user,'pwd':$scope.password,'ip':'68.12.157.176','device_port':'3030','device_name':'gateway'};
    ws.emit('get_token', data);
    console.log("get token for " + data['user']);
  };
  
  $scope.firstName = "John";
  $scope.lastName = "Doe";
  $scope.set = function() {
    var mac = $scope.mac;
    var user = $scope.user;
    var password = $scope.password;
    var port = $scope.port;
    var device_name = $scope.device_name;
    
    console.log(user);
    $.post( "//68.12.157.176:8080/pyfi.org/php/set_video.php",{mac:mac, user:user, pwd:password, port:port, device_name:device_name}).success(function(data){
      console.log("server said " + data);
    });
  };
});
