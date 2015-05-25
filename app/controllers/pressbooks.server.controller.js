'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  config = require('../../config/config'),
  async = require('async'),
  errorHandler = require('./errors.server.controller'),
  Pressbook = mongoose.model('Pressbook'),
  Pin = mongoose.model('Pin'),
  ImageModel = mongoose.model('Image'),
  pdf = require('html-pdf'),
  fs = require('fs'),
  NodeZip = new require('node-zip'),
  _ = require('lodash');

/**
 * Show the current pressbook
 */
exports.read = function(req, res) {
  res.json(req.pressbook);
};

var getImageLink = function (pressbook) {
  if(pressbook && pressbook.image) {
    return 'http://localhost:' + config.port + '/uploads/' + pressbook.image.filename;
  } else if(pressbook && pressbook.pin) {
    return pressbook.pin.imageLink.replace('237x', '736x');
  }
};
var getSourceUrl = function(pressbook) {
  if(pressbook && pressbook.pin) {
    return 'Source: ' + pressbook.pin.link;
  } else {
    return '';
  }
};

exports.generate = function(req, res) {
  var textTemplate = unescape(req.query.text) || '';

  Pressbook.find({user: req.user}).populate([{path:'image', select:'filename'}, {path:'pin', select:'imageLink link'}]).exec(function(err, pressbooks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      var zip = new NodeZip();
      var html = fs.readFileSync('template.html', 'utf8');
      var options = {
        format: 'A4',
        quality: 100,
        timeout: 300000
      };

      async.forEach(pressbooks, function(pressbook, callback) {
        var textTemplateWithContent = textTemplate
          .replace(/%%placeholder1%%/g, pressbook.placeholder1.trim())
          .replace(/%%placeholder2%%/g, pressbook.placeholder2.trim())
          .replace(/%%placeholder3%%/g, pressbook.placeholder3.trim())
          .replace(/%%placeholder4%%/g, pressbook.placeholder4.trim())
          .replace(/%%sourceUrl%%/g, getSourceUrl(pressbook))
          .trim()
          .replace(/\n|\r/g, '<br>');

        var htmlWithContent = html
          .replace(/%%imageLink%%/, getImageLink(pressbook))
          .replace(/%%text%%/, textTemplateWithContent);

        pdf.create(htmlWithContent, options).toBuffer(function(err, data) {
          if (err) return console.log(err);
          zip.file('template' + Math.floor(Math.random() * (1000 - 0)) + 0 + '.pdf', data);
          callback();
        });
      }, function(err) {
        var willSendthis = zip.generate({
          base64:false,
          compression:'DEFLATE'
        });

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=pressbook.zip');
        res.set('Content-Length', willSendthis.length);
        res.end(willSendthis, 'binary');
      });
    }
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
  Pressbook.find({user: req.user}).sort('-created').populate('image', 'filename').populate('pin', 'imageLink').exec(function(err, pressbooks) {
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
  Pressbook.findById(id).exec(function(err, pressbook) {
    if (err) return next(err);
    if (!pressbook) return next(new Error('Failed to load pressbook ' + id));
    req.pressbook = pressbook;
    next();
  });
};

/**
 * Pressbook authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.pressbook.user.toString() !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};
