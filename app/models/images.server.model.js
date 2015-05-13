'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Image Schema
 */
var ImageSchema = new Schema({
  _id: {
    type: String,
    default: '',
  },
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    default: '',
    trim: true
  },
  filename: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    default: '',
    trim: true
  },
  size: {
    type: Number,
    default: '',
    trim: true
  },
  width: {
    type: Number,
    default: '',
    trim: true
  },
  height: {
    type: Number,
    default: '',
    trim: true
  },
  path: {
    type: String,
    default: '',
    trim: true
  },
  isInPressbook: {
    type: Boolean,
    default: '',
    trim: true
  }
});

mongoose.model('Image', ImageSchema);
