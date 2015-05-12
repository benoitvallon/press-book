'use strict';

//Pins service used for communicating with the pins REST endpoints
angular.module('pins').factory('Pins', ['$resource',
  function($resource) {
    return $resource('pins/:pinId', {
      pinId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);