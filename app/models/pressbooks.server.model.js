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
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  pin: {
    type: String,
    ref: 'Pin'
  },
  image: {
    type: String,
    ref: 'Image'
  },
  placeholder1: {
    type: String,
    default: '',
    trim: true
  },
  placeholder2: {
    type: String,
    default: '',
    trim: true
  },
  placeholder3: {
    type: String,
    default: '',
    trim: true
  },
  placeholder4: {
    type: String,
    default: '',
    trim: true
  },
});

mongoose.model('Pressbook', PressbookSchema);
