.controller('CategoriesCtrl', function($scope, Categories) {
  $scope.categories = Categories.all();
  $scope.remove = function(chat) {
    Categories.remove(chat);
  };
})
