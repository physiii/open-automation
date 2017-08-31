angular.module('main_site', ['socket-io'])
.controller('index', function($scope,$rootScope) {
  var TAG = "[index]";

  $scope.goto = function(path) {
    console.log(TAG,'goto',path);
    window.location.replace("/"+path);
  }

  $scope.show_form = function(form) {
    if (form == "register_form") {
      document.getElementById("register_form").style.display = "inline";
      document.getElementById("register_form_btn").style.display = "none";
      document.getElementById("login_form").style.display = "none";
      document.getElementById("login_form_btn").style.display = "inline";
    }
    if (form == "login_form") {
      document.getElementById("login_form").style.display = "inline";
      document.getElementById("login_form_btn").style.display = "none";
      document.getElementById("register_form").style.display = "none";
      document.getElementById("register_form_btn").style.display = "inline";
    }
    console.log("show_form: ",form);
  }


  //$rootScope.login_message = "init";
  $scope.login = function(user) {
    console.log(user);
    $.post( "/login",user).success(function(data){
      console.log("login!",data);
      if (data.error) {
        console.log("error",data.error);
        return;
      }
      $.cookie('user',data.user, { path: '/' });
      $.cookie('token',data.token, { path: '/' });
      window.location.replace("/home");
    }).fail(function(data) {
    document.getElementById("login_message").style.display = "inline";
    $scope.$apply(function () {
      $rootScope.login_message = "Invalid username/password";
    });
    console.log( "error: ",data );
  });
  }
  
  $scope.register = function(user) {
    $.post( "/register",user).success(function(data){
      if (data.error) {
        document.getElementById("register_message").style.display = "inline";
        $scope.$apply(function () {
          $rootScope.register_message = data.error;
        });
        console.log("error",data.error);
        return;
      }
      console.log("register",data);
      $.cookie('user',data.username, { path: '/' } );
      $.cookie('token',data.token, { path: '/' } );
      window.location.replace("/home");
    });
  }

  $scope.show_login = function() {
    document.getElementById("pyfi_logo").style.display = "none";
    document.getElementById("main_login_form").style.display = "inline";
    document.getElementById("main_register_form").style.display = "none";
    document.getElementById("price_generator_form").style.display = "none";
    document.getElementById("motion_detector_form").style.display = "none";
  }
  
  $scope.show_register = function() {
    document.getElementById("pyfi_logo").style.display = "none";
    document.getElementById("main_login_form").style.display = "none";
    document.getElementById("main_register_form").style.display = "inline";
    document.getElementById("price_generator_form").style.display = "none";
    document.getElementById("motion_detector_form").style.display = "none";
  }

  $scope.download_android = function() {
    var ifrm = document.getElementById("download_android");
    ifrm.src = '/downloads/beacon.apk';
    console.log(TAG,"downloading android app");
  }
  
  $scope.show_price_generator = function() {
    document.getElementById("contact_form").style.display = "none";
    document.getElementById("main_login_form").style.display = "none";
    document.getElementById("main_register_form").style.display = "none";
    document.getElementById("price_generator_form").style.display = "inline";
    document.getElementById("motion_detector_form").style.display = "none";
  }

  $scope.show_motion_detector_form = function() {
    document.getElementById("contact_form").style.display = "none";
    document.getElementById("main_login_form").style.display = "none";
    document.getElementById("main_register_form").style.display = "none";
    document.getElementById("price_generator_form").style.display = "none";
    document.getElementById("motion_detector_form").style.display = "inline";
  }

});
