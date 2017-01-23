angular.module('starter.services', [])
/*
.factory('cameraFactory', ['$rootScope','$http', function($rootScope,$http,$scope) {
///////////////////////////////////---  formatting for post ----//////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////////////////////  
  console.log("<<--- camera factory | "+$rootScope.username+" --->>");
  var myService = {
    get: function() {
      var promise = $http.post("php/fetch_cameras.php",{user:$rootScope.username}).success(function(data){
        var cameras = [];    
        $.each(data, function(i, field){    
          cameras[i] = {
            user:field.user,
            device_name:field.device_name,
            mac:field.mac,
            ip:field.ip,          
            port:field.port,
            token:field.token
          }
        });
        console.log("<<--- factory: "+cameras[0].user+" | "+cameras[0].mac+" --->> ");
        $rootScope.cameras = cameras;
        return "hitt";
      });      
      
      // Return the promise to the controller
      return promise;
    }
  };
  return myService;  
}])
.factory('gatewayFactory', ['$http','$rootScope', function($http,$scope,$rootScope) {
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
  
  console.log("<<--- gateway factory | "+$scope.username+" --->>");
  var myService = {
    get: function() {
      var promise = $http.post("php/fetch_cameras.php",{user:$scope.username}).success(function(data){
        var gateways = [];    
        $.each(data, function(i, field){    
          gateways[i] = {
            user:field.user,
            device_name:field.device_name,
            mac:field.mac,
            ip:field.ip,          
            port:field.port,
            token:field.token
          }
        });
        console.log("<<--- factory: "+gateways[0].user+" | "+gateways[0].mac+" --->> ");
        $rootScope.cameras = cameras;
        return "hitt";
      });      
      
      // Return the promise to the controller
      return promise;
    }
  };
  return myService;  
}])
*/
/*.factory('deviceFactory', ['$rootScope','$http', function($rootScope,$http,$scope) {
///////////////////////////////////---  formatting for post ----//////////////////////////////////////

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
////////////////////////////////////////////////////////////////////////////////////////////////////  
  console.log("<<--- device factory | "+$rootScope.username+" --->>");
  var myService = {
    get: function() {
      var promise = $http.post("php/fetch_devices.php",{user:$rootScope.username}).success(function(data){
        var cameras = [];
        var gateways = [];        
        $.each(data, function(i, field){
          cameras[i] = {
            user:field.user,
            device_name:field.device_name,
            mac:field.mac,
            ip:field.ip,          
            port:field.port,
            token:field.token
          }
        });
        console.log("<<--- factory: "+cameras[0].user+" | "+cameras[0].mac+" --->> ");
        $rootScope.cameras = cameras;
        $rootScope.cameras = gateways;
        return "hitt";
      });      
      
      // Return the promise to the controller
      return promise;
    }
  };
  return myService;  
}])*/

.factory('Categories', function($http) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var categories = [
 {
    id: 0,
    name: 'Media',
    lastText: '3 active',
    icon: 'fa fa-volume-up fa-5x'
  }, {
    id: 1,
    name: 'Lights',
    lastText: '3 active',
    icon: 'fa fa-lightbulb-o fa-5x'
  }, {
    id: 2,
    name: 'Video',
    lastText: '3 active',
    icon: 'fa fa-video-camera fa-5x'
  }, {
    id: 3,
    name: 'Climate',
    lastText: '3 active',
    icon: 'fa fa-cloud fa-5x'
  }, {
    id: 4,
    name: 'Access',
    lastText: '3 active',
    icon: 'fa fa-lock fa-5x'
  },/* {
    id: 5,
    name: 'Files',
    lastText: '3 active',
    icon: 'fa fa-list fa-5x'
  },*/  {
    id: 6,
    name: 'Health',
    lastText: '3 active',
    icon: 'fa fa-medkit fa-5x'
  },  {
    id: 7,
    name: 'Alerts',
    lastText: '3 active',
    icon: 'fa fa-support fa-5x'
  }
  /*, {
    id: 8,
    name: 'Power',
    lastText: '3 active',
    icon: 'fa fa-support fa-5x'
  }, {
    id: 9,
    name: 'Blinds',
    lastText: '3 active',
    icon: 'fa fa-support fa-5x'
  }*/
];

  return {
    all: function() {
      return categories;
    },
    remove: function(category) {
      categories.splice(categories.indexOf(category), 1);
    },
    get: function(categoryId) {
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].id === parseInt(categoryId)) {
          return categories[i];
        }
      }
      return null;
    }
  };
});
