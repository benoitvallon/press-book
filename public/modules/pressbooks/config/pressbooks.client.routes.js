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
    state('generatePressbook', {
      url: '/pressbooks/generate',
      templateUrl: 'modules/pressbooks/views/generate-pressbook.client.view.html'
    }).
    state('viewPressbook', {
      url: '/pressbooks/:pressbookId',
      templateUrl: 'modules/pressbooks/views/view-pressbook.client.view.html'
    });
  }
]);
