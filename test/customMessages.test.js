var assert = require('assert');

var _ = require('lodash');
require('should');

var lusitania = require('../index.js');
var testType = require('./util/testType.js');

describe('custom validation messages ($message syntax)', function() {

  it(' should use custom validation message when `$message` is a string', function() {

    var error = lusitania({
      name: 'Sebastian',
      id: '235',
      friends: 'd'
    }).to({
      type: {
        name: {
          $validate: {
            type: 'string'
          },
          $message: 'oops0'
        },
        id: {
          $validate: {
            type: 'numeric'
          },
          $message: 'oops1'
        },
        friends: {
          $validate: {
            type: []
          },
          $message: 'oops2'
        },
        moreFriends: {
          $validate: {
            type: 'array'
          },
          $message: 'oops3'
        },

        // This one will trigger an invalid usage error,
        // since $validate is required if $message is used:
        foo: {
          $message: 'oops4'
        }

      }
    });

    error.message.should.equal('oops2');
    error.should.have.properties({
      message: 'oops2',
      data: 'd',
      property: 'friends',
      actualType: 'string',
    });
  });

});
