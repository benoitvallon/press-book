'use strict';

angular.module('pressbooks').controller('PressbooksController', ['$scope', '$stateParams', '$location', 'Pressbooks', '$http',
  function($scope, $stateParams, $location, Pressbooks, $http) {
    $scope.pressbookTempo = {};

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

    $scope.update = function(pressbook) {
      if($scope.pressbookTempo.placeholder1) {
        pressbook.placeholder1 = $scope.pressbookTempo.placeholder1;
        $scope.pressbookTempo.placeholder1 = '';
      }
      if($scope.pressbookTempo.placeholder2) {
        pressbook.placeholder2 = $scope.pressbookTempo.placeholder2;
        $scope.pressbookTempo.placeholder2 = '';
      }
      if($scope.pressbookTempo.placeholder3) {
        pressbook.placeholder3 = $scope.pressbookTempo.placeholder3;
        $scope.pressbookTempo.placeholder3 = '';
      }
      if($scope.pressbookTempo.placeholder4) {
        pressbook.placeholder4 = $scope.pressbookTempo.placeholder4;
        $scope.pressbookTempo.placeholder4 = '';
      }

      pressbook.$update(function(err) {
        pressbook.edit = false;
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
      if(pressbook && pressbook.image) {
        return '/uploads/' + pressbook.image.filename;
      } else if(pressbook && pressbook.pin) {
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

    $scope.edit = function(pressbook) {
      pressbook.edit = !pressbook.edit;

      if(pressbook.edit) {
        $scope.pressbookTempo.placeholder1 = pressbook.placeholder1;
        $scope.pressbookTempo.placeholder2 = pressbook.placeholder2;
        $scope.pressbookTempo.placeholder3 = pressbook.placeholder3;
        $scope.pressbookTempo.placeholder4 = pressbook.placeholder4;
      } else {
        $scope.pressbookTempo.placeholder1 = '';
        $scope.pressbookTempo.placeholder2 = '';
        $scope.pressbookTempo.placeholder3 = '';
        $scope.pressbookTempo.placeholder4 = '';
      }
    };

    $scope.updateText = function() {
      $scope.textTemplateEncoded = encodeURIComponent($scope.textTemplate);
    };
  }
]);
