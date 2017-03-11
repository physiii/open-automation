.controller('CategoryDetailCtrl', function($scope, $stateParams, Categories) {
  $scope.chat = Categories.get($stateParams.chatId);
})
