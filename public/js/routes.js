var app = angular.module("open-automation", ['ngRoute','ngMaterial','socket-io','duParallax','material.svgAssetsCache','ngMessages']);
app.config(function ($routeProvider,$locationProvider) {
  $locationProvider.hashPrefix('');
  $routeProvider
  .when("/", {
      templateUrl : "templates/landing.html",
       controller : "landing"
   })
  .when("/demo", {
      controller: "DemoCtrl",
      templateUrl : "templates/demo.html",
  })
  .when("/dashboard", {
      templateUrl : "templates/dashboard.html",
  })
  .when("/rooms", {
      templateUrl : "templates/rooms.html",
  })
  .when("/settings", {
      templateUrl : "templates/settings.html",
  });
});
