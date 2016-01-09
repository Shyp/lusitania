var lusitania = require('../index.js');
require('should');

describe('error messages', function() {
  it('null errors should be readable', function() {
    var result = lusitania(null).to({
      type: 'number',
    }, {
      validation: 'foo'
    });
    result.message.should.equal('`foo` should be a number (instead of null)');
  });

  it('other type errors should be readable', function() {
    var result = lusitania('blah').to({
      type: 'number',
    }, {
      validation: 'foo'
    });
    result.message.should.equal('`foo` should be a number (instead of "blah", which is a string)');
  });

  it('calls it a field if no validation is defined', function() {
    var result = lusitania('blah').to({
      type: 'number',
    }, { });
    result.message.should.equal('`field` should be a number (instead of "blah", which is a string)');
  });
});
