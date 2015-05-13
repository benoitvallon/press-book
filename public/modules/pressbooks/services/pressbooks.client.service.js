'use strict';

//Pressbooks service used for communicating with the pressbooks REST endpoints
angular.module('pressbooks').factory('Pressbooks', ['$resource',
  function($resource) {
    return $resource('pressbooks/:pressbookId', {
      pressbookId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);