'use strict';

// Setting up route
angular.module('pins').config(['$stateProvider',
  function($stateProvider) {
    // Pins state routing
    $stateProvider.
    state('listPins', {
      url: '/pins',
      templateUrl: 'modules/pins/views/list-pins.client.view.html'
    }).
    state('createPin', {
      url: '/pins/create',
      templateUrl: 'modules/pins/views/create-pin.client.view.html'
    }).
    state('viewPin', {
      url: '/pins/:pinId',
      templateUrl: 'modules/pins/views/view-pin.client.view.html'
    });
  }
]);
