'use strict';

/**
 * Module dependencies.
 */
var pressbooks = require('../../app/controllers/pressbooks.server.controller');

module.exports = function(app) {
  // Pressbook Routes
  app.route('/pressbooks')
    .get(pressbooks.list);

  app.route('/pressbooks/generate')
    .get(pressbooks.generate);

  app.route('/pressbooks/:pressbookId')
    .get(pressbooks.read)
    .put(pressbooks.update)
    .delete(pressbooks.delete);

  // Finish by binding the pressbook middleware
  app.param('pressbookId', pressbooks.pressbookByID);
};
