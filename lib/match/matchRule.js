/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var rules = require('./rules');


/**
 * Match a miscellaneous rule
 * Returns an empty list on success,
 * or an error if things go wrong
 */

module.exports = function matchRule (data, ruleName, args) {
  var self = this;

  // if args is an array we need to make it a nested array
  if (Array.isArray(args)) {
    args = [args];
  }

  // Ensure args is a list, then prepend it with data
  if (!_.isArray(args)) {
    args = [args];
  }

  // push data on to front
  args.unshift(data);

  // Lookup rule and determine outcome
  var outcome;
  var rule = rules[ruleName];
  if (!rule) {
    throw new Error('Unknown rule: ' + ruleName);
  }
  try {
    outcome = rule.apply(self, args);
  } catch (e) {
    outcome = false;
  }

  // If outcome is false, an error occurred
  if (!outcome) {
    var fieldName;
    if (typeof this.validation === 'undefined' || this.validation === null) {
      fieldName = 'field';
    } else {
      fieldName = this.validation;
    }

    var err;
    if (ruleName === 'required') {
      err = new Error(util.format('No %s was provided. Please provide a %s', fieldName, fieldName));
    } else {
      err = new Error(util.format('Invalid %s. Input failed %s validation: %s', fieldName, ruleName, util.inspect(data)));
    }

    err.data = data;
    err.rule = ruleName;
    return err;
  } else {
    return null;
  }
};
