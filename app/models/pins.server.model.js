'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Pin Schema
 */
var PinSchema = new Schema({
  _id: {
    type: String,
    default: '',
  },
  created: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  accountName: {
    type: String,
    default: '',
    trim: true
  },
  boardName: {
    type: String,
    default: '',
    trim: true
  },
  link: {
    type: String,
    default: '',
    trim: true
  },
  imageLink: {
    type: String,
    default: '',
    trim: true
  },
  isInPressbook: {
    type: Boolean,
    default: false,
    trim: true
  },
  pressbookID: {
    type: String,
    default: '',
  },
});

mongoose.model('Pin', PinSchema);
