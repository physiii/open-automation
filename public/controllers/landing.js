angular.module('open-automation')

.controller('landing', function($scope, $rootScope, parallaxHelper, $timeout, $mdSidenav, $log) {
  var TAG = "[landing]";
  console.log(TAG,"start");
  $scope.show_logo = true;
  $scope.background = parallaxHelper.createAnimator(-5, 100, 0);
  $scope.show_login_form = false;
  $scope.showDarkTheme = true;
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
    console.log("loging in, " + user);
    $.post( "/login",user).success(function(data){
      console.log("login!",data);
      if (data.error) {
        console.log("error",data.error);
        return;
      }
      $.cookie('user',data.user, { path: '/' });
      $.cookie('token',data.token, { path: '/' });
      window.location.replace("#/dashboard");
    }).fail(function(data) {
    //document.getElementById("login_message").style.display = "inline";
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
    /*document.getElementById("price_generator_form").style.display = "none";
    document.getElementById("motion_detector_form").style.display = "none";*/
    console.log("show login!")
  }
  
  $scope.show_register = function() {
    document.getElementById("pyfi_logo").style.display = "none";
    document.getElementById("main_login_form").style.display = "none";
    document.getElementById("main_register_form").style.display = "inline";
    //document.getElementById("price_generator_form").style.display = "none";
    //document.getElementById("motion_detector_form").style.display = "none";
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

})

.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
  $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
  $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
  $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();

    $mdThemingProvider.theme('docs-dark', 'default')
      .primaryPalette('yellow')
      .dark();

})

.controller('LoginCtrl', function ($scope, $timeout, $mdSidenav, $log, $rootScope, socket) {
  $scope.login = function(user) {
    console.log("loging in, " + user);
    $.post( "/login",user).success(function(data){
      console.log("login!",data);
      $scope.close();
      if (data.error) {
        console.log("error",data.error);
        return;
      }
      $.cookie('user',data.user, { path: '/' });
      $.cookie('token',data.token, { path: '/' });
      window.location.replace("#/dashboard");
    }).fail(function(data) {
    //document.getElementById("login_message").style.display = "inline";
    $scope.$apply(function () {
      $scope.login_message = "Invalid username/password";
    });
    console.log( "error: ",data );
  });
  }
})

.controller('NavCtrl', function ($scope, $timeout, $mdSidenav, $log, $rootScope, socket) {
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

  $scope.show_login_form = false;
  $scope.show_login_form_btn = true;
  $scope.show_login = function() {
    $scope.show_login_form = true;
    $scope.show_login_form_btn = false;
    /*document.getElementById("pyfi_logo").style.display = "none";
    document.getElementById("main_login_form").style.display = "inline";
    document.getElementById("main_register_form").style.display = "none";*/
    console.log("show login!")
  }


    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;

      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }

    function buildToggler(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
    }
  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });

    };
  })
  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };
  })
