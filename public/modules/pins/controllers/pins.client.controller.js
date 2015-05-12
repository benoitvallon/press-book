'use strict';

angular.module('pins').controller('PinsController', ['$scope', '$stateParams', '$location', 'Pins',
  function($scope, $stateParams, $location, Pins) {

    $scope.create = function() {
      var pin = new Pins({
        title: this.title,
        content: this.content
      });
      pin.$save(function(response) {
        $location.path('pins/' + response._id);

        $scope.title = '';
        $scope.content = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.remove = function(pin) {
      if (pin) {
        pin.$remove();

        for (var i in $scope.pins) {
          if ($scope.pins[i] === pin) {
            $scope.pins.splice(i, 1);
          }
        }
      } else {
        $scope.pin.$remove(function() {
          $location.path('pins');
        });
      }
    };

    $scope.update = function() {
      var pin = $scope.pin;

      pin.$update(function() {
        $location.path('pins/' + pin._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.find = function() {
      $scope.pins = Pins.query();
    };

    $scope.findOne = function() {
      $scope.pin = Pins.get({
        pinId: $stateParams.pinId
      });
    };
  }
]);
