'use strict';

angular.module('images').controller('ImagesController', ['$scope', '$stateParams', '$location', 'Images', '$http', 'FileUploader',
  function($scope, $stateParams, $location, Images, $http, FileUploader) {

    var uploader = $scope.uploader = new FileUploader({
        url: '/images'
    });

    uploader.filters.push({
        name: 'imageFilter',
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
      $location.path('images');
    };

    $scope.remove = function(image) {
      if (image) {
        image.$remove();

        for (var i in $scope.images) {
          if ($scope.images[i] === image) {
            $scope.images.splice(i, 1);
          }
        }
      } else {
        $scope.image.$remove(function() {
          $location.path('images');
        });
      }
    };

    $scope.find = function() {
      $scope.images = Images.query();
    };

    $scope.findOne = function() {
      $scope.image = Images.get({
        imageId: $stateParams.imageId
      });
    };

    $scope.addToPressbook = function(image) {
      image.isInPressbook = !image.isInPressbook;

      image.$update(function() {
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.convertSize = function(image) {
      return Math.round(image.size / 1024 / 1024 * 100) / 100 + 'Mb';
    };
  }
]);
