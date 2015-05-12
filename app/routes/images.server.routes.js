'use strict';

/**
 * Module dependencies.
 */
var images = require('../../app/controllers/images.server.controller');

module.exports = function(app) {
  // Image Routes
  app.route('/images')
    .get(images.list)
    .post(images.create);

  app.route('/images/:imageId')
    .get(images.read)
    .delete(images.delete);

  // Finish by binding the image middleware
  app.param('imageId', images.imageByID);
};
