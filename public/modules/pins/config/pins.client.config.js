'use strict';

// Configuring the Pins module
angular.module('pins').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Pins', 'pins', 'dropdown', '/pins(/create)?');
    Menus.addSubMenuItem('topbar', 'pins', 'List Pins', 'pins');
    Menus.addSubMenuItem('topbar', 'pins', 'Extract Pins', 'pins/create');
  }
]);
