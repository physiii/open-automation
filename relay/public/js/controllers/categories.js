angular.module('starter.controllers')

.controller('CategoriesCtrl', function($scope, Categories) {
  $scope.categories = Categories.all();
  $scope.remove = function(chat) {
    Categories.remove(chat);
  };
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, Categories) {
  $scope.chat = Categories.get($stateParams.chatId);
})
