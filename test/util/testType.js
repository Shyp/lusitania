var _ = require('lodash');
var async = require('async');
var lusitania = require('../../index.js');

// Test a rule given a deliberate example and nonexample
// Test WITH and WITHOUT callback
module.exports = function testType (rule, example, nonexample) {

	// Throw an error if there's any trouble
	// (not a good production usage pattern-- just here for testing)
	var exampleOutcome, nonexampleOutcome;

	// Should be falsy
	exampleOutcome = lusitania(example).to({
		type: rule
	});

	// Should be an array
	nonexampleOutcome = lusitania(nonexample).to({
		type: rule
	});

	if (exampleOutcome) {
		return gotErrors(exampleOutcome);
	}
	if (!(nonexampleOutcome instanceof Error)) {
		return gotErrors('Invalid input (' + JSON.stringify(nonexample) + ') allowed through as a ' + JSON.stringify(rule) + '.');
	}

	function gotErrors (err) {
		throw new Error(err);
	}
};
