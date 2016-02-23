var util = require('util');

var should = require('should');
var _ = require('lodash');

var lusitania = require('../index.js');
var testRules = require('./util/testRules.js');

describe('miscellaneous rules', function() {
  describe('required', function() {
    it('fails for various empty inputs', function() {
      var emptyInputs = [
        '',
        false,
        null,
        undefined,
        [],
        // FWIW 0 is an allowable value
      ];
      var context = {
        validation: 'email',
      };
      for (var i = 0; i < emptyInputs.length; i++) {
        var val = emptyInputs[i];
        l = lusitania(val);
        result = l.to({ required: true }, context);
        result.should.be.instanceof(Error, util.inspect(val) + " should fail required validation, but didn't");
        result.message.should.equal('No email was provided. Please provide a email');
      }
    });
  });

  describe ('max/min',function () {
    it (' should support "max" rule ', function () {
      return testRules({
        max: 3
      }, 2, 5);
    });

    it('should return a good error message', function() {
      var context = {
        validation: 'day',
      };
      l = lusitania(27);
      result = l.to({ type: 'integer', required: true, min: 0, max: 24 }, context);
      result.should.be.instanceof(Error);
      result.message.should.equal('Invalid day. Input failed max validation: 27');
    });
  });

  describe ('greaterThan/lessThan',function () {
    it (' should support "greaterThan" rule ', function () {
      return testRules({
        greaterThan: 3.5
      },4,3);
    });
    it (' should support "greaterThan" rule ', function () {
      return testRules({
        greaterThan: 3.5
      },3.6,3.5);
    });
    it (' should support "lessThan" rule ', function () {
      return testRules({
        lessThan: 3.5
      },3,4);
    });
    it (' should support "lessThan" rule ', function () {
      return testRules({
        lessThan: 3.5
      },3.4,3.5);
    });
  });

  describe('url', function () {

    it ('should support "url" rule with no options', function () {
      return testRules({ url: true }, 'http://sailsjs.org', 'sailsjs');
    });

    it ('should support "url" rule with options', function () {
      return testRules({ url: { require_protocol: true } }, 'http://sailsjs.org', 'www.sailsjs.org');
    });
  });

  describe('before/after date', function () {
    it (' should support "before" rule ', function () {
      return testRules({
        before: new Date()
      },new Date(Date.now() - 100000),new Date(Date.now() + 1000000));
    });
  });

});
