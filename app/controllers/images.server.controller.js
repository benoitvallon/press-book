'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  formidable = require('formidable'),
  fs = require('fs'),
  crypto = require('crypto'),
  sizeOf = require('image-size'),
  errorHandler = require('./errors.server.controller'),
  ImageModel = mongoose.model('Image'),
  _ = require('lodash');

/**
 * Create a image
 */
exports.create = function(req, res) {

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var algo = 'md5';
    var shasum = crypto.createHash(algo);

    fs.readFile(files.file.path, function (err, data) {
      var checksum = shasum.update(data).digest('hex');
      var newPath = __dirname + '/../../public/uploads/' + checksum;

      var dimensions = sizeOf(data);

      fs.writeFile(newPath, data, function (err) {
        files.file._id = checksum;
        files.file.filename = checksum;
        files.file.width = dimensions.width;
        files.file.height = dimensions.height;
        var file = new ImageModel(files.file);
        file.save(function(err) {
          res.json({});
        });
      });
    });
  });
};

/**
 * Show the current image
 */
exports.read = function(req, res) {
  res.json(req.image);
};

/**
 * Update a image
 */
exports.update = function(req, res) {
  var image = req.image;

  image = _.extend(image, req.body);

  image.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(image);
    }
  });
};

/**
 * Delete an image
 */
exports.delete = function(req, res) {
  var image = req.image;

  image.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(image);
    }
  });
};

/**
 * List of Images
 */
exports.list = function(req, res) {
  ImageModel.find().exec(function(err, images) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(images);
    }
  });
};

/**
 * Image middleware
 */
exports.imageByID = function(req, res, next, id) {
  ImageModel.findById(id).populate('user', 'displayName').exec(function(err, image) {
    if (err) return next(err);
    if (!image) return next(new Error('Failed to load image ' + id));
    req.image = image;
    next();
  });
};

/**
 * Image authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.image.user.id !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};
