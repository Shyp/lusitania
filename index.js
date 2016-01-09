/**
* Module dependencies
*/

var util = require('lodash');
var sanitize = require('validator').sanitize;

/**
* Public access
*/

module.exports = function (entity) {
  return new Lusitania(entity);
};

/**
* Constructor of individual instance of Lusitania
* Specify the function, object, or list to be lusitaniaed
*/

function Lusitania (entity) {
  if (util.isFunction(entity)) {
    this.fn = entity;
    throw new Error ('Lusitania does not support functions yet!');
  }
  else this.data = entity;

  return this;
}

/**
* Built-in data type rules
*/

Lusitania.prototype.rules = require('./lib/match/rules');

/**
* Enforce that the data matches the specified ruleset
*/

Lusitania.prototype.to = function (ruleset, context) {

  var error = false;
  // If ruleset doesn't contain any explicit rule keys,
  // assume that this is a type

  var validation;
  if (typeof context !== "undefined" && typeof context.validation !== "undefined") {
    validation = context.validation;
  } else {
    validation = 'field';
  }
  // Look for explicit rules
  for (var rule in ruleset) {

    var result;
    if (rule === 'type') {

      // Use deep match to descend into the collection and verify each item and/or key
      // Stop at default maxDepth (50) to prevent infinite loops in self-associations
      result = Lusitania.match.type.call(context, this.data, ruleset.type, null, validation);
      if (result) {
        error = result;
        break;
      }
    }

    // Validate a non-type rule
    else {
      result = Lusitania.match.rule.call(context, this.data, rule, ruleset[rule]);
      if (result) {
        error = result;
        break;
      }
    }
  }

  return error;

};
Lusitania.prototype.hasErrors = Lusitania.prototype.to;


/**
* Coerce the data to the specified ruleset if possible
* otherwise throw an error
* Priority: this should probably provide the default
* implementation in Waterline core.  Currently it's completely
* up to the adapter to define type coercion.
*
* Which is fine!.. but complicates custom CRUD adapter development.
* Much handier would be an evented architecture, that allows
* for adapter developers to write:
*
{
// Called before find() receives criteria
// Here, criteria refers to just attributes (the `where`)
// limit, skip, and sort are not included
coerceCriteria: function (criteria) {
return criteria;
},

// Called before create() or update() receive values
coerceValues: function () {}

}
*
* Adapter developers would be able to use Lusitania.prototype.cast()
* to declaratively define these type coercions.

* Down the line, we could take this further for an even nicer API,
* but for now, this alone would be a nice improvement.
*
*/

Lusitania.prototype.cast = function (ruleset) {
  todo();
};




/**
* Coerce the data to the specified ruleset no matter what
*/

Lusitania.prototype.hurl = function (ruleset) {

  // Iterate trough given data attributes
  // to check if they exist in the ruleset
  for (var attr in this.data) {
    if (this.data.hasOwnProperty(attr)) {

      // If it doesnt...
      if (!ruleset[attr]) {

        // Declaring err here as error helpers live in match.js
        var err = new Error('Validation error: Attribute \"' + attr + '\" is not in the ruleset.');

        // just throw it
        throw err;
      }
    }
  }

  // Once we make sure that attributes match
  // we can just proceed to deepMatch
  Lusitania.match(this.data, ruleset, this);
};





/**
* Specify default values to automatically populated when undefined
*/

Lusitania.prototype.defaults = function (ruleset) {
  todo();
};





/**
* Declare a custom data type
* If function definition is specified, `name` is required.
* Otherwise, if dictionary-type `definition` is specified,
* `name` must not be present.
*
* @param {String} name				[optional]
* @param {Object|Function}	definition
*/

Lusitania.prototype.define = function (name, definition) {

  // check to see if we have an dictionary
  if ( util.isObject(name) ) {

    // if so all the attributes should be validation functions
    for (var attr in name){
      if(!util.isFunction(name[attr])){
        throw new Error('Definition error: \"' + attr + '\" does not have a definition');
      }
    }

    // add the new custom data types
    util.extend(Lusitania.prototype.rules, name);

    return this;

  }

  if ( util.isFunction(definition) && util.isString(name) ) {

    // Add a single data type
    Lusitania.prototype.rules[name] = definition;

    return this;

  }

  throw new Error('Definition error: \"' + name + '\" is not a valid definition.');
};





/**
* Specify custom ruleset
*/

Lusitania.prototype.as = function (ruleset) {
  todo();
};




/**
* Specify named arguments and their rulesets as an object
*/

Lusitania.prototype.args = function (args) {
  todo();
};




/**
* Specify each of the permitted usages for this function
*/

Lusitania.prototype.usage = function () {
  var usages = util.toArray(arguments);
  todo();
};




/**
* Deep-match a complex collection or model against a schema
*/

Lusitania.match = require('./lib/match');





/**
* Expose `define` so it can be used globally
*/

module.exports.define = Lusitania.prototype.define;





function todo() {
  throw new Error('Not implemented yet! If you\'d like to contribute, tweet @mikermcneil.');
}
