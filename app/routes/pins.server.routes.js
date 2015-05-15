'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    pins = require('../../app/controllers/pins.server.controller');

module.exports = function(app) {
  // Pin Routes
  app.route('/pins')
    .get(users.requiresLogin, pins.list)
    .post(users.requiresLogin, pins.create);

  app.route('/pins/:pinId')
    .get(users.requiresLogin, pins.hasAuthorization, pins.read)
    .put(users.requiresLogin, pins.hasAuthorization, pins.update)
    .delete(users.requiresLogin, pins.hasAuthorization, pins.delete);

  // Finish by binding the pin middleware
  app.param('pinId', pins.pinByID);
};
