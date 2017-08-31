angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $compile) {
  console.log("<----- MapCtrl ----->");
  var relay_socket = $rootScope.relay_socket;
  var TAG = "[MapCtrl]";
  $.getJSON("https://ipinfo.io", function (data) {
    var lat = data.loc.substring(0,7);
    var lng = data.loc.substring(8,16);
    $rootScope.ipLatitude = lat;
    $rootScope.ipLongitude = lng;    
    url = "https://forecast.io/embed/#lat="+lat+"&lon="+lng+"&name=" + data.city;
    $('#forecast_embed').attr('src', url);  
    $scope.ipAddress = data.ip;
    $scope.postal = data.postal;
    $rootScope.postal = data.postal;
    $rootScope.initialize_map();
  });

  var markers = [];
  $rootScope.initialize_map = function () {
    var myLatlng = new google.maps.LatLng($rootScope.ipLatitude,$rootScope.ipLongitude);
    var marker = new google.maps.Marker({    
        position: myLatlng,
        map: $rootScope.map
      });
    var mapOptions = {
      center: new google.maps.LatLng($rootScope.ipLatitude, $rootScope.ipLongitude),  
      zoom: 7,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $rootScope.map = new google.maps.Map(document.getElementById("map"),mapOptions);
    //marker.setMap($rootScope.map);
    console.log("<----- initialize_map -----> Lat: ",$rootScope.ipLatitude);
  }

  $rootScope.update_map = function (device) {
    mobile = $rootScope.mobile;
    var location = device.status;
    //console.log("update_map",location);
    Latlng = new google.maps.LatLng(location.latitude, location.longitude);
    console.log(TAG,device);
    var contentString = "<div>" + device.mac + "<br>";
        contentString += "Signal: "+location.cell_signal_level+"<br>";
        contentString += "Battery: "+(location.battery.toPrecision(2))*100+"%<br>";
        contentString += "Speed: "+location.speed+"<br>";
        contentString += "Wifi: "+location.connected_wifi+"<br>";
        contentString += "<a ng-click=\"ping_audio('start','"+device.token+"')\">Start Ping</a>    |    ";
        contentString += "<a ng-click=\"ping_audio('stop','"+device.token+"')\">Stop Ping</a></div>";
    var compiled = $compile(contentString)($scope);
    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });      
    var marker = new google.maps.Marker({
      position: Latlng,
      title: location.mac,
      map: $rootScope.map
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
    
    for (var i = 0; i < markers.length; i++) {
      var title = markers[i].getTitle();
      if (title === location.mac) {
        //markers[i].setMap(null);
      }
    }
    markers.push(marker);
  }
})
