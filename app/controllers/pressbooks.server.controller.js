'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require('async'),
  errorHandler = require('./errors.server.controller'),
  Pressbook = mongoose.model('Pressbook'),
  Pin = mongoose.model('Pin'),
  ImageModel = mongoose.model('Image'),
  pdf = require('html-pdf'),
  fs = require('fs'),
  _ = require('lodash');

/**
 * Show the current pressbook
 */
exports.read = function(req, res) {
  res.json(req.pressbook);
};

exports.generate = function(req, res) {

  var html = fs.readFileSync('template-html.html', 'utf8');
  var options = { filename: 'template.pdf', format: 'Letter' };

  pdf.create(html, options).toFile(function(err, data) {
    if (err) return console.log(err);
    console.log(data); // { filename: '/tmp/html-pdf-8ymPV.pdf' }
    res.json({});
  });

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
      if(pressbook.image) {
        pressbook.populate('image', 'filename', function(err, pressbook) {
          res.json(pressbook);
        });
      } else if (pressbook.pin) {
        pressbook.populate('pin', 'imageLink', function(err, pressbook) {
          res.json(pressbook);
        });
      }
    }
  });
};

/**
 * Delete an pressbook
 */
exports.delete = function(req, res) {
  var pressbook = req.pressbook;

  var relatedAsset = {};
  if(pressbook.image) {
    ImageModel.findById(pressbook.image, function(err, image) {
      relatedAsset = image;
      saveAsset();
    });
  } else if(pressbook.pin) {
    Pin.findById(pressbook.pin, function(err, pin) {
      relatedAsset = pin;
      saveAsset();
    });
  }

  var saveAsset = function() {
    relatedAsset.isInPressbook = false;
    relatedAsset.pressbookID = '';
    console.log('relatedAsset', relatedAsset);
    relatedAsset.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      pressbook.remove(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        }
        res.json(pressbook);
      });
    });
  };
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
