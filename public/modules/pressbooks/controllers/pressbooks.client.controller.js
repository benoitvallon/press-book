'use strict';

angular.module('pressbooks').controller('PressbooksController', ['$scope', '$stateParams', '$location', 'Pressbooks', '$http', 'FileUploader',
  function($scope, $stateParams, $location, Pressbooks, $http, FileUploader) {

    var uploader = $scope.uploader = new FileUploader({
        url: '/pressbooks'
    });

    uploader.filters.push({
        name: 'pressbookFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
      // console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
      // console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
      // console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
      // console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
      // console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
      // console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
      // console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
      console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
      // console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
      // console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
      // console.info('onCompleteAll');
      $location.path('pressbooks');
    };

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

    $scope.find = function() {
      $scope.pressbooks = Pressbooks.query();
    };

    $scope.findOne = function() {
      $scope.pressbook = Pressbooks.get({
        pressbookId: $stateParams.pressbookId
      });
    };
  }
]);
