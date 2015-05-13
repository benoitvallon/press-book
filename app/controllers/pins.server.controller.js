'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require('async'),
  errorHandler = require('./errors.server.controller'),
  Pin = mongoose.model('Pin'),
  _ = require('lodash');

var pinterestAPI = require('pinterest-api');

/**
 * Create a pin
 */
exports.create = function(req, res) {

  if(!req.body.accountName || !req.body.boardName) {
    return res.status(400).send({
      message: 'Account name or board name missing'
    });
  }

  var pinterest = pinterestAPI(req.body.accountName);
  pinterest.setObtainDates(false);

  // default and max is 50
  // pinterest.setItemsPerPage(50);

  pinterest.getPinsFromBoard(req.body.boardName, true, function (pins) {
    async.forEach(pins.data, function (pin, callback){
      // adding some data
      pin._id = pin.id;
      pin.accountName = req.body.accountName;
      pin.boardName = req.body.boardName;
      pin.imageLink = pin.images['237x'].url;

      // replace some special character
      pin.description = pin.description.replace(/&#233;/g, 'é');

      pin = new Pin(pin);
      pin.save(function(err) {
        callback(); // tell async that the iterator has completed
      });
    }, function(err) {
      res.json({});
    });
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
  Pin.find().exec(function(err, pins) {
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
