angular.module('starter.controllers', ['socket-io'])

.controller('ExampleController', ['$scope', function($scope) {

}])

.controller('DashCtrl', function($scope, $ionicLoading, $compile, $http) { 

})

.controller('DeviceCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('LightsCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {
  var ws = io.connect('http://127.0.0.1:3000');
  $scope.send_lights = function(command) {
    ws.emit('lights', command);
    console.log(command);
  };
})

.controller('VideoCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {

})

.controller('ClimateCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {

})

.controller('AccessCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {

})

.controller('PiCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {

})

.controller('MediaCtrl', function($scope, $stateParams, Chats, socket, $ionicLoading, $compile, $http) {
  $scope.chat = Chats.get($stateParams.chatId);
  
  var ws = io.connect('http://127.0.0.1:3000');
  
  $scope.media_dash = function(command) {
    ws.emit('media_upstairs', command);
    ws.emit('media_downstairs', command);
    console.log("dash: " + command);
  };  
  
  $scope.media_upstairs = function(command) {
    ws.emit('media_upstairs', command);
    console.log(command);
  };
  
  $scope.media_downstairs = function(command) {
    ws.emit('media_downstairs', command);
    console.log(command);
  };
  
  $scope.peerflix_downstairs = function(link) {
    ws.emit('peerflix_downstairs', link);
    console.log(link);
  };  
  
  $scope.peerflix_upstairs = function(link) {
    ws.emit('peerflix_upstairs', link);
    console.log(link);
  }; 
})
.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('userinfo', function($scope, $http) {
  $.getJSON("http://ipinfo.io", function (data) {
    var lat = data.loc.substring(0,7);
    var lng = data.loc.substring(8,16);
    url = "http://forecast.io/embed/#lat="+lat+"&lon="+lng+"&name=" + data.city;
    console.log(url);
    $('#forecast_embed').attr('src', url);  
    console.log("ipinfo: " + data.loc.substring(0,7));
    $scope.ipAddress = data.ip;
    $scope.postal = data.postal;    
  });
  username = $('#username').html();
  $scope.username = username;
  console.log("<<--- userinfo --->> " + $scope.username);
})

.controller('AccountCtrl', function($scope, $stateParams, Chats, socket,$ionicLoading, $compile, $http) {
  console.log('<<---- account controller --->>');
  $scope.master = {};
  $.getJSON("http://ipinfo.io", function (data) {
    $scope.ipAddress = data.ip;
  });
  $scope.update = function(user) {
    $scope.master = angular.copy(user);
    username = $('#username').html();
    /*if (typeof user === 'undefined') {
      $.post("/addDevice.php",{ipAddress:ipAddress, port:port, user:username});    
      console.log('hit');
    }*/
    console.log(user.ip + ":" + user.port); 
    $.post("/php/addDevice.php",{ipAddress:user.ip, port:user.port, user:username});    
  };
  
/*  $scope.addDevice = function(ip,port) {
    username = $('#username').html();    
    console.log(ip + ":" + port);
    $.post("/addDevice.php",{ipAddress:ip, port:port, user:username});
  }   */
  $scope.settings = {
    enableFriends: true
  };
})

.controller('MapsCtrl', function($scope, $stateParams, Chats, socket,$ionicLoading, $compile, $http) {
  console.log('MapsCtrl');
  var points = [];
  var markers = [];
  var map;

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
    
  function initialize_all_coord(mac) {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: {lat: parseFloat(points[0].lat), lng: parseFloat(points[0].lng)}
    });
    $scope.map = map;
    drop(mac);
  } 
  function initialize_last_coord(mac) {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: {lat: parseFloat(points[mac].lat), lng: parseFloat(points[mac].lng)}
    });
    $scope.map = map;
    last_pin(mac);
  }   

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }
    
  function drop(mac) {
    for (var i = 0; i < points.length; i++) {
      var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
      var compiled = $compile(contentString)($scope);
      var infowindow = new google.maps.InfoWindow({
        content: compiled[0]
      });
      if (mac == "10:A5:D0:2F:51:F8") {
        var markerStyle = {
          path: google.maps.SymbolPath.CIRCLE,
          strokeColor: 'red',
          strokeWeight: 4,
          scale: 1
        };
      } 
      if (mac == "02:00:00:00:00:00") {
        var markerStyle = {
          path: google.maps.SymbolPath.CIRCLE,
          strokeColor: 'blue',
          strokeWeight: 4,
          scale: 1
        };
      }
      addMarkerWithTimeout(mac, points[i], i * 0,markerStyle),"0";
    }
  }

  function last_pin(mac) {
      if (mac == "10:A5:D0:2F:51:F8") {
        markerStyle = {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          strokeColor: 'red',
          strokeWeight: 2,
          scale: 6
        };
      } 
      if (mac == "02:00:00:00:00:00") {
        markerStyle = {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          strokeColor: 'blue',
          strokeWeight: 2,
          scale: 6
        };
      }
      addMarkerWithTimeout(mac, points[mac],0,markerStyle,"1");
  }
  
  function addMarkerWithTimeout(mac, position, timeout, markerStyle,isLastpin) {  
      //console.log(position.mac + " " + position.lat+","+position.lng);
      window.setTimeout(function() {               
      var contentString = '<div id="content">'+ mac +
        '<h3>physiii\'s phone</h3>'+
        '<p><a ng-click=\'start_ping("'+mac+'")\'>start ping</a> | ' +
        '<a ng-click=\'stop_ping("'+mac+'")\'>stop ping</a></p>'+
        '<p><a ng-click=\'street_view("'+mac+'")\'>street view</a></p>' +        
        '</div>';                          
      var compiled = $compile(contentString)($scope);
      var infowindow = new google.maps.InfoWindow({
        content: compiled[0]
      });        
      var pin = new google.maps.Marker({
        icon: markerStyle,
        position: position,
        map: map,
        animation: google.maps.Animation.DROP
      })
      if (isLastpin == "1"){
        google.maps.event.addListener(pin, 'click', function() {
          infowindow.open(map,pin);
          console.log(position.mac);
        });                                 
      }
      markers.push(pin);     
    }, timeout);
  }

  $scope.fetch_markers = function(mac) {
    $http.post("/php/fetch.php",{user:'andy',mac:mac}).success(function(data){
      $.each(data, function(i, field){
        console.log("markers: " + field.mac);      
        points[i] = {
          lng:parseFloat(field.longitude), 
          lat:parseFloat(field.latitude),
          mac:parseFloat(field.mac)
        }
      });
      initialize_all_coord(mac);
    });
  }
  
  $scope.last_marker = function(mac) {
    $http.post("/php/fetch_last.php",{mac:mac}).success(function(data){
      $.each(data, function(i, field){
        console.log("last marker: " + field.mac);   
        points[mac] = {
          lng:parseFloat(field.longitude), 
          lat:parseFloat(field.latitude),
          mac:parseFloat(mac)
        }
      });
      initialize_last_coord(mac);
    });
  }
  
  $scope.centerOnMe = function() {
    if(!$scope.map) {
      return;
    }
    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });
    navigator.geolocation.getCurrentPosition(function(pos) {
      //post pos.coords.latitude position.coords.longitude with id of 'find me' and the public / private ip
      $.getJSON("http://jsonip.com?callback=?", function (data) {
        console.log("ip: " + data.ip);
      });    
      mapOptions = {
        position: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        pov: {heading: pos.heading, pitch: 0},
        zoom: 1
      };
      var map = new google.maps.StreetViewPanorama(document.getElementById('map'),mapOptions);
      $scope.loading.hide();
    }, function(error) {
      alert('Unable to get location: ' + error.message);
    });
  };  
  
  $scope.clickTest = function() {
    alert('Example of infowindow with ng-click')
  };

  $scope.start_ping = function(mac_addr) { 
    console.log("start pinging " + mac_addr);
    $.post( "/php/command.php",{command:"ping", value:"start",mac:mac_addr});
  }

  $scope.stop_ping = function(mac_addr) {
    console.log("stop pinging " + mac_addr);
    $.post( "/php/command.php",{command:"ping", value:"stop",mac:mac_addr});
  }
  
  $scope.fetch_markers("02:00:00:00:00:00");
  $scope.fetch_markers("10:A5:D0:2F:51:F8");
  $scope.last_marker("10:A5:D0:2F:51:F8");
  $scope.last_marker("02:00:00:00:00:00");  
});



