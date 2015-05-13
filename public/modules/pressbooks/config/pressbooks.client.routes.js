'use strict';

// Setting up route
angular.module('pressbooks').config(['$stateProvider',
  function($stateProvider) {
    // Pressbooks state routing
    $stateProvider.
    state('listPressbooks', {
      url: '/pressbooks',
      templateUrl: 'modules/pressbooks/views/list-pressbooks.client.view.html'
    }).
    state('createPressbook', {
      url: '/pressbooks/create',
      templateUrl: 'modules/pressbooks/views/create-pressbook.client.view.html'
    }).
    state('viewPressbook', {
      url: '/pressbooks/:pressbookId',
      templateUrl: 'modules/pressbooks/views/view-pressbook.client.view.html'
    });
  }
]);
