/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var rules = require('./rules');
var errorFactory = require('./errorFactory');


// Exposes `matchType` as `deepMatchType`.
module.exports = deepMatchType;


var RESERVED_KEYS = {
  $validate: '$validate',
  $message: '$message'
};

// Max depth value
var MAX_DEPTH = 50;



/**
 * Match a complex collection or model against a schema
 *
 * @param {} data
 * @param {} ruleset
 * @param {} depth
 * @param {} keyName
 * @param {String} customMessage
 *                   (optional)
 * 
 * @returns a list of errors (or an empty list if no errors were found)
 */

function deepMatchType(data, ruleset, depth, keyName, customMessage) {

  var self = this;

  // Prevent infinite recursion
  depth = depth || 0;
  if (depth > MAX_DEPTH) {
    throw new Error('Exceeded MAX_DEPTH when validating object.  Maybe it\'s recursively referencing itself?');
  }

  // (1) Base case - primitive
  // ----------------------------------------------------
  // If ruleset is not an object or array, use the provided function to validate
  if (!_.isObject(ruleset)) {
    return matchType.call(self, data, ruleset, keyName);
  }


  // (2) Recursive case - Array
  // ----------------------------------------------------
  // If this is a schema rule, check each item in the data collection
  else if (_.isArray(ruleset)) {
    if (ruleset.length !== 0) {
      if (ruleset.length > 1) {
        throw new Error('[] (or schema) rules can contain only one item.');
      }

      // Handle plurals (arrays with a schema rule)
      // Match each object in data array against ruleset until error is detected
      return _.reduce(data, function getErrors(errors, datum) {
        errors = errors.concat(deepMatchType.call(self, datum, ruleset[0], depth + 1, keyName));
        return errors;
      }, []);
    }
    // Leaf rules land here and execute the iterator fn
    else return matchType.call(self, data, ruleset, keyName);
  }

  // (3) Recursive case - POJO
  // ----------------------------------------------------
  // If the current rule is an object, check each key
  else {

    // Note:
    // 
    // We take advantage of a couple of preconditions at this point:
    // (a) ruleset must be an Object
    // (b) ruleset must NOT be an Array

    // Check for special reserved keys
    var subValidation = ruleset[RESERVED_KEYS.$validate];
    customMessage = ruleset[RESERVED_KEYS.$message];

    if (subValidation) {
      // { $validate: {...} } specified as data type
      // runs a sub-validation (recursive)
      ruleset = subValidation;
    }
    if (customMessage) {
      // { $message: '...' } specified as data type
      // uses supplied message instead of the default

    }


    // Don't treat empty object as a ruleset
    // Instead, treat it as 'object'
    if (_.keys(ruleset).length === 0) {
      return matchType.call(self, data, ruleset, keyName, customMessage);
    } else {
      // Iterate through rules in dictionary until error is detected
      return _.reduce(ruleset, function(errors, subRule, key) {

        // Prevent throwing when encountering unexpectedly "shallow" data
        // (instead- this should be pushed as an error where "undefined" is
        // not of the expected type: "object")
        if (!_.isObject(data)) {
          errors.push(errorFactory(data, 'object', key, customMessage));
          return errors;
        } else {
          errors = errors.concat(deepMatchType.call(self, data[key], ruleset[key], depth + 1, key, customMessage));
          return errors;
        }
      }, []);
    }
  }
}



/**
 * `matchType()`
 * 
 * Return whether a piece of data matches a rule
 *
 * @param {?} datum
 * @param {Array|Object|String|Regexp} ruleName
 * @param {String} keyName
 * @param {String} customMessage
 *                      (optional)
 *
 * @returns a list of errors, or an empty list in the absense of them
 * @api private
 */

function matchType(datum, ruleName, keyName, customMessage) {

  var self = this;

  try {
    var rule;
    var outcome;

    // Determine rule
    if (_.isEqual(ruleName, [])) {
      // [] specified as data type checks for an array
      rule = _.isArray;
    }
    else if (_.isEqual(ruleName, {})) {
      // {} specified as data type checks for any object
      rule = _.isObject;
    }
    else if (_.isRegExp(ruleName)) {
      // Allow regexes to be used
      rule = function(x) {
        // If argument to regex rule is not a string,
        // fail on 'string' validation
        if (!_.isString(x)) {
          rule = rules['string'];
        } else x.match.call(self, ruleName);
      };
    }
    // Lookup rule
    else rule = rules[ruleName];


    // Determine outcome
    if (!rule) {
      throw new Error('Unknown rule: ' + ruleName);
    }
    else outcome = rule.call(self, datum);

    // If validation failed, return an error
    if (!outcome) {
      return errorFactory(datum, ruleName, keyName, customMessage);
    }

    // If everything is ok, return an empty list
    else return [];
  }
  catch (e) {
    return errorFactory(datum, ruleName, keyName, customMessage);
  }

}
