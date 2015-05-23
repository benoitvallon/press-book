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
  Pressbook = mongoose.model('Pressbook'),
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
        files.file._id = checksum + req.user._id;
        files.file.filename = checksum;
        files.file.width = dimensions.width;
        files.file.height = dimensions.height;
        var image = new ImageModel(files.file);
        image.user = req.user;

        image.save(function(err) {
          res.json(image);
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
  var pressbook = new Pressbook();

  var saveImage = function() {
    image.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json(image);
    });
  };

  // the image must be in pressbook and does not have an id, it needs to be created
  if(image.isInPressbook && !image.pressbookID) {
    pressbook.image = image._id;
    pressbook.user = req.user;
    pressbook.save(function(err, data) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      image.pressbookID = data._id;
      saveImage();
    });
  }
  // the image must not be in pressbook and has an id, it needs to be deleted
  else if(!image.isInPressbook && image.pressbookID) {
    pressbook._id = image.pressbookID;

    image.pressbookID = '';
    pressbook.remove(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      saveImage();
    });
  } else {
    saveImage();
  }
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
  ImageModel.find({user: req.user}).exec(function(err, images) {
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
  ImageModel.findById(id).exec(function(err, image) {
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
  if (req.image.user.toString() !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};
