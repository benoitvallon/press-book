'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Pin = mongoose.model('Pin'),
	_ = require('lodash');

/**
 * Create a pin
 */
exports.create = function(req, res) {
	var pin = new Pin(req.body);
	pin.user = req.user;

	pin.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(pin);
		}
	});
};

/**
 * Show the current pin
 */
exports.read = function(req, res) {
	res.json(req.pin);
};

/**
 * Update a pin
 */
exports.update = function(req, res) {
	var pin = req.pin;

	pin = _.extend(pin, req.body);

	pin.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(pin);
		}
	});
};

/**
 * Delete an pin
 */
exports.delete = function(req, res) {
	var pin = req.pin;

	pin.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(pin);
		}
	});
};

/**
 * List of Pins
 */
exports.list = function(req, res) {
	Pin.find().sort('-created').populate('user', 'displayName').exec(function(err, pins) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(pins);
		}
	});
};

/**
 * Pin middleware
 */
exports.pinByID = function(req, res, next, id) {
	Pin.findById(id).populate('user', 'displayName').exec(function(err, pin) {
		if (err) return next(err);
		if (!pin) return next(new Error('Failed to load pin ' + id));
		req.pin = pin;
		next();
	});
};

/**
 * Pin authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.pin.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
