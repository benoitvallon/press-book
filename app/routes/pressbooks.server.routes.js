'use strict';

/**
 * Module dependencies.
 */
var pressbooks = require('../../app/controllers/pressbooks.server.controller');

module.exports = function(app) {
  // Pressbook Routes
  app.route('/pressbooks')
    .get(pressbooks.list);
};
