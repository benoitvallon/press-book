'use strict';

angular.module('pressbooks').controller('PressbooksController', ['$scope', '$stateParams', '$location', 'Pressbooks',
  function($scope, $stateParams, $location, Pressbooks) {

    $scope.remove = function(pressbook) {
      if (pressbook) {
        pressbook.$remove();

        for (var i in $scope.pressbooks) {
          if ($scope.pressbooks[i] === pressbook) {
            $scope.pressbooks.splice(i, 1);
          }
        }
      } else {
        $scope.pressbook.$remove(function() {
          $location.path('pressbooks');
        });
      }
    };

    $scope.update = function() {
      var pressbook = $scope.pressbook;

      pressbook.$update(function() {
        $location.path('pressbooks/' + pressbook._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.find = function() {
      $scope.pressbooks = Pressbooks.query();
    };

    $scope.findOne = function() {
      $scope.pressbook = Pressbooks.get({
        pressbookId: $stateParams.pressbookId
      });
    };

    $scope.getImageLink = function (pressbook) {
      if(pressbook.image) {
        return '/uploads/' + pressbook.image.filename;
      } else if(pressbook.pin) {
        return pressbook.pin.imageLink.replace('237x', '736x');
      }
    };

    $scope.getType = function (pressbook) {
      if(pressbook.image) {
        return 'Image';
      } else if(pressbook.pin) {
        return 'Pin';
      }
    };
  }
]);
