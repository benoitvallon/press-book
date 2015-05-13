'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Pressbook Schema
 */
var PressbookSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  pin: {
    type: Schema.ObjectId,
    ref: 'Pin'
  },
  image: {
    type: Schema.ObjectId,
    ref: 'Image'
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  imageLink: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('Pressbook', PressbookSchema);
