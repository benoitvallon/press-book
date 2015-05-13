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
    type: String,
    ref: 'Pin'
  },
  image: {
    type: String,
    ref: 'Image'
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
});

mongoose.model('Pressbook', PressbookSchema);
