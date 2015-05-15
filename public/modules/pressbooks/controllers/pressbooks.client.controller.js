'use strict';

angular.module('pressbooks').controller('PressbooksController', ['$scope', '$stateParams', '$location', 'Pressbooks', '$http', 'Authentication',
  function($scope, $stateParams, $location, Pressbooks, $http, Authentication) {
    $scope.authentication = Authentication;

    $scope.pressbookTempo = {};

    $scope.placeholder1 = {};
    $scope.placeholder2 = {};
    $scope.placeholder3 = {};
    $scope.placeholder4 = {};

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
      if($scope.placeholder1.value) {
        pressbook.placeholder1 = $scope.placeholder1.value;
        $scope.placeholder1.value = '';
      }
      if($scope.placeholder2.value) {
        pressbook.placeholder2 = $scope.placeholder2.value;
        $scope.placeholder2.value = '';
      }
      if($scope.placeholder3.value) {
        pressbook.placeholder3 = $scope.placeholder3.value;
        $scope.placeholder3.value = '';
      }
      if($scope.placeholder4.value) {
        pressbook.placeholder4 = $scope.placeholder4.value;
        $scope.placeholder4.value = '';
      }
      updateAcPlaceholderValues(pressbook);

      pressbook.$update(function(err) {
        pressbook.edit = false;
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.find = function() {
      $scope.pressbooks = Pressbooks.query(function(data) {
        $scope.pressbooks.forEach(function(pressbook) {
          updateAcPlaceholderValues(pressbook);
        });
      });
    };

    var updateAcPlaceholderValues = function(pressbook) {
      if(pressbook.placeholder1 &&
          !~$scope.acPlaceholder1Values.indexOf(pressbook.placeholder1)) {
        $scope.acPlaceholder1Values.push(pressbook.placeholder1);
      }
      if(pressbook.placeholder2 &&
          !~$scope.acPlaceholder2Values.indexOf(pressbook.placeholder2)) {
        $scope.acPlaceholder2Values.push(pressbook.placeholder2);
      }
      if(pressbook.placeholder3 &&
          !~$scope.acPlaceholder3Values.indexOf(pressbook.placeholder3)) {
        $scope.acPlaceholder3Values.push(pressbook.placeholder3);
      }
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
        $scope.placeholder1.value = pressbook.placeholder1;
        $scope.placeholder2.value = pressbook.placeholder2;
        $scope.placeholder3.value = pressbook.placeholder3;
        $scope.placeholder4.value = pressbook.placeholder4;
      } else {
        $scope.placeholder1.value = '';
        $scope.placeholder2.value = '';
        $scope.placeholder3.value = '';
        $scope.placeholder4.value = '';
      }
    };

    $scope.updateText = function() {
      $scope.textTemplateEncoded = encodeURIComponent($scope.textTemplate);
    };

    $scope.acPlaceholder1Values = [];
    $scope.acPlaceholder2Values = [];
    $scope.acPlaceholder3Values = [];

    function suggestPlaceholder1(term) {
      var q = term.toLowerCase().trim();
      var results = [];
      // Find first 10 acPlaceholder1 that start with `term`.
      for (var i = 0; i < $scope.acPlaceholder1Values.length && results.length < 10; i++) {
        var state = $scope.acPlaceholder1Values[i];
        if (state.toLowerCase().indexOf(q) === 0)
          results.push({ label: state, value: state });
      }
      return results;
    }

    $scope.acPlaceholder1 = {
      suggest: suggestPlaceholder1
    };

    function suggestPlaceholder2(term) {
      var q = term.toLowerCase().trim();
      var results = [];
      // Find first 10 acPlaceholder2 that start with `term`.
      for (var i = 0; i < $scope.acPlaceholder2Values.length && results.length < 10; i++) {
        var state = $scope.acPlaceholder2Values[i];
        if (state.toLowerCase().indexOf(q) === 0)
          results.push({ label: state, value: state });
      }
      return results;
    }

    $scope.acPlaceholder2 = {
      suggest: suggestPlaceholder2
    };

    function suggestPlaceholder3(term) {
      var q = term.toLowerCase().trim();
      var results = [];
      // Find first 10 acPlaceholder3 that start with `term`.
      for (var i = 0; i < $scope.acPlaceholder3Values.length && results.length < 10; i++) {
        var state = $scope.acPlaceholder3Values[i];
        if (state.toLowerCase().indexOf(q) === 0)
          results.push({ label: state, value: state });
      }
      return results;
    }

    $scope.acPlaceholder3 = {
      suggest: suggestPlaceholder3
    };
  }
]);
