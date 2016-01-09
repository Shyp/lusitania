var _ = require('lodash');
var lusitania = require('../index.js');
var async = require('async');
var assert = require("assert");

describe('Custom Types', function() {

	describe('Single Definition', function() {
		it(' should properly validate a simple object with a custom type', function() {
			var rules = {
				houseNumber: 'five'
			},
			example = {
				houseNumber: 5
			},

			isfive = function(val){
				return val === 5;
			};

			assert.equal(false, lusitania(example).define("five", isfive).to({type:rules}));
		});
	});

	describe('Dictonary of Definitions', function() {
		it(' should properly validate a simple object with a custom type', function() {
			var rules = {
				houseNumber: 'five',
				fish: 'yummyFish'
			},
			example = {
				houseNumber: 5,
				fish: 'tuna'
			},

			definition = {
				five: function(val){
					return val === 5;
				},
				yummyFish: function(val){
					return val === "tuna";
				}
			};

			assert.equal(false, lusitania(example).define(definition).to({type:rules}));
		});
	});

	describe('Context', function() {
		it(' should support providing context for rules via',function () {
			var user = { password: 'passW0rd', passwordConfirmation: 'passW0rd' };

			lusitania.define('password', function (password) {
				return password === this.passwordConfirmation;
			});

			var outcome = lusitania(user.password).to({ type: 'password' }, user);

			assert.equal(false, outcome);
		});
	});
});
