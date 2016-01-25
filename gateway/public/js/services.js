var app = angular.module('cameraFactory', []);
app.factory('myService', function($http) {

  var myService = {
    async: function() {   
      // $http returns a promise, which has a then function, which also returns a promise
      var promise = $http.post("php/remove_camera.php",{user:$scope.username, mac:mac_addr}).then(function (response) {
        // The then function here is an opportunity to modify the response
        console.log(response);
        // The return value gets picked up by the then in the controller.
        return response.data;
      });
      // Return the promise to the controller
      return promise;
    }
  };
  return myService;
});
