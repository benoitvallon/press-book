'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require('async'),
  errorHandler = require('./errors.server.controller'),
  Pressbook = mongoose.model('Pressbook'),
  _ = require('lodash');

/**
 * Create a pressbook
 */
exports.create = function(req, res) {
  res.json({});
};

/**
 * Show the current pressbook
 */
exports.read = function(req, res) {
  res.json(req.pressbook);
};

/**
 * Update a pressbook
 */
exports.update = function(req, res) {
  var pressbook = req.pressbook;

  pressbook = _.extend(pressbook, req.body);

  pressbook.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pressbook);
    }
  });
};

/**
 * Delete an pressbook
 */
exports.delete = function(req, res) {
  var pressbook = req.pressbook;

  pressbook.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pressbook);
    }
  });
};

/**
 * List of Pressbooks
 */
exports.list = function(req, res) {
  Pressbook.find().sort('-created').populate('image', 'filename').populate('pin', 'imageLink').exec(function(err, pressbooks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(pressbooks);
    }
  });
};

/**
 * Pressbook middleware
 */
exports.pressbookByID = function(req, res, next, id) {
  Pressbook.findById(id).populate('image', 'size').exec(function(err, pressbook) {
    if (err) return next(err);
    if (!pressbook) return next(new Error('Failed to load pressbook ' + id));
    req.pressbook = pressbook;
    next();
  });
};
