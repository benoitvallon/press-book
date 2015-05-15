'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    pressbooks = require('../../app/controllers/pressbooks.server.controller');

module.exports = function(app) {
  // Pressbook Routes
  app.route('/pressbooks')
    .get(users.requiresLogin, pressbooks.list);

  app.route('/pressbooks/generate')
    .get(users.requiresLogin, pressbooks.generate);

  app.route('/pressbooks/:pressbookId')
    .get(users.requiresLogin, pressbooks.hasAuthorization, pressbooks.read)
    .put(users.requiresLogin, pressbooks.hasAuthorization, pressbooks.update)
    .delete(users.requiresLogin, pressbooks.hasAuthorization, pressbooks.delete);

  // Finish by binding the pressbook middleware
  app.param('pressbookId', pressbooks.pressbookByID);
};
