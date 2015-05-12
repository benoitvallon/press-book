'use strict';

/**
 * Module dependencies.
 */
var pins = require('../../app/controllers/pins.server.controller');

module.exports = function(app) {
	// Pin Routes
	app.route('/pins')
		.get(pins.list)
		.post(pins.create);

	app.route('/pins/:pinId')
		.get(pins.read)
		.put(pins.update)
		.delete(pins.delete);

	// Finish by binding the pin middleware
	app.param('pinId', pins.pinByID);
};
