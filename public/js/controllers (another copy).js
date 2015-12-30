angular.module('starter.controllers', ['socket-io'])

.controller('DashCtrl', function($scope, $ionicLoading, $compile, $http) {

  var ws = io.connect('http://68.12.157.176:3000');

  $scope.send_lights = function(command) {
    ws.emit('lights', command);
    console.log(command);
  };

  $scope.media_dash = function(command) {
    ws.emit('media_upstairs', command);
    ws.emit('media_downstairs', command);
    console.log("dash: " + command);
  };
  
  
  // If you're adding a number of markers, you may want to drop them on the map
  // consecutively rather than all at once. This example shows how to use
  // window.setTimeout() to space your markers' animation.

  $http.get("/fetch.php").success(function(data){
    var points = [
      {lat: 52.511, lng: 13.447},
      {lat: 52.549, lng: 13.422},
      {lat: 52.497, lng: 13.396},
      {lat: 52.517, lng: 13.394}
    ];
    var markers = [];
    var map;

    $.each(data, function(i, field){
      points[i] = {
        lng:parseFloat(field.longitude), 
        lat:parseFloat(field.latitude),
        mac:parseFloat(field.mac)
      }
    });

    function initialize() {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: parseFloat(points[1].lat), lng: parseFloat(points[1].lng)}
      });
      $scope.map = map;
      drop();
    } 

    function drop() {
      clearMarkers();
      for (var i = 0; i < points.length; i++) {
        if (points[i].mac == "10") {

        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

          var markerStyle = {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: 'red',
            strokeWeight: 9,
            scale: 5
          };
        } else {
          var markerStyle = {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: 'blue',
            strokeWeight: 6,
            scale: 5
          };
        }
        addMarkerWithTimeout(points[i], i * 0,markerStyle);
      }
    }

    function addMarkerWithTimeout(position, timeout, markerStyle) {
      window.setTimeout(function() {
        markers.push(new google.maps.Marker({
          icon: markerStyle,
          position: position,
          map: map,
          animation: google.maps.Animation.DROP
        }));
    }, timeout);
  }

    function clearMarkers() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
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
    initialize();
  });


  
})

.controller('DeviceCtrl', function($scope, $stateParams, Chats, socket,$ionicLoading, $compile, $http) {

  $scope.start_ping = function() {
    $.post( "command.php",{command:"ping", value:"1"});
  }

  $scope.stop_ping = function() {
    $.post( "command.php",{command:"ping", value:"0"});
  }

  $scope.chat = Chats.get($stateParams.chatId);
  var ws = io.connect('http://68.12.157.176:3000');
  $scope.send_lights = function(command) {
    ws.emit('lights', command);
    console.log(command);
  };
  $scope.media_upstairs = function(command) {
    ws.emit('media_upstairs', command);
    console.log(command);
  };
  $scope.media_downstairs = function(command) {
    ws.emit('media_downstairs', command);
    console.log(command);
  };

})



.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
  $scope.test = function(message) {
    alert(message);
  };
 
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});



