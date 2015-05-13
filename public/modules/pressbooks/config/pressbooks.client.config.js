'use strict';

// Configuring the Pressbooks module
angular.module('pressbooks').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Pressbooks', 'pressbooks', 'dropdown', '/pressbooks(/create)?');
    Menus.addSubMenuItem('topbar', 'pressbooks', 'List Pressbooks', 'pressbooks');
  }
]);
