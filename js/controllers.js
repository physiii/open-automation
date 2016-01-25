var app = angular.module('starter', ['ionic'])

.controller('device_info', function($scope,$scope,$http) {
  ///////////////////////////////////////////////////////////////////////////////////////////////
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
  ///////////////////////////////////////////////////////////////////////////////////////////////
  $scope.firstName = "John";
  $scope.lastName = "Doe";
  $scope.machine_address = "b827eb91903b";
  $scope.local_ip = "192.168.0.18";
  $scope.public_ip = "68.12.157.176";  
  $scope.device_port = "3031";
  $scope.device_name = "Gateway";
  
  var mac = $scope.machine_address;
  var user = $scope.user;
  var password = $scope.password;
  var device_name = $scope.device_name;
  var device_port = $scope.device_port;
  var token = "init";    

  
  $scope.edit_device_name = function(command) {
    if (command == "show"){
      document.getElementById("li_device_name").style.display = "none";
      document.getElementById("input_device_name").style.display = "block";
    } else {
      document.getElementById("li_device_name").style.display = "block";
      document.getElementById("input_device_name").style.display = "none";    
    }
  }
  
  $scope.edit_device_port = function(command) {
    if (command == "show"){
      document.getElementById("li_device_port").style.display = "none";
      document.getElementById("input_device_port").style.display = "block";
    } else {
      document.getElementById("li_device_port").style.display = "block";
      document.getElementById("input_device_port").style.display = "none";    
    }
  }  

  $http.get("/php/device_info.php").success(function(data){
    console.log("local_ip: " + data[0].local_ip);
    $scope.machine_address = data[0].mac;
    $scope.local_ip = data[0].local_ip;
    $scope.public_ip = data[0].public_ip;   
    $scope.device_port = data[0].device_port;
    $scope.device_name = data[0].device_name;    
  });

  $.post( "php/device_info.php",{mac:mac, user:user, pwd:password, port:device_port, device_name:device_name}).success(function(data){ 

    console.log("server said " + data['mac']);
    console.log("server said " + data);    
  });
})

.controller('post_ctrl', function($rootScope,$scope,$http) {
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
  
  $scope.set = function() {
    var mac = $scope.machine_address;
    var user = $scope.user;
    var password = $scope.password;
    var device_name = $scope.device_name;
    var device_port = $scope.device_port;
    var token = "init";  

    $.post( "//68.12.157.176:8080/pyfi.org/php/set_device.php",{mac:mac, user:user, pwd:password, port:device_port, device_name:device_name,}).success(function(data){
      token = data;
      store_device();
    });
    
    var store_device = function (){
      console.log("storing token: " + token);
      $.post( "php/set_device.php",{mac:mac, user:user, pwd:password, port:device_port, device_name:device_name}).success(function(data){
        console.log("token stored!!! " + data);
      });    
    }
  };
});
