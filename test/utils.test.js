/*global require, describe, it, sinon */

const assert = require('assert');
const Utils = require('../src/javascript/utils');
const jade = require('jade');

describe('Utils', function () {

	it('should provide log functionality', function () {
		assert.ok(Utils.log);
	});

	it('should provide is functionality', function () {
		[
			{ value: undefined, answer: 'undefined' },
			{ value: null, answer: 'object' },
			{ value: false, answer: 'boolean' },
			{ value: true, answer: 'boolean' },
			{ value: "", answer: 'string' },
			{ value: 1, answer: 'number' },
			{ value: [], answer: 'object' },
			{ value: {}, answer: 'object' },
			{ value: function () {}, answer: 'function' }
		].forEach(function (test) {
			assert.ok(Utils.is(test.value, test.answer), test.value + " is a " + test.answer);
		});
	});

	it('should provide isUndefined functionality', function () {
		assert.ok(Utils.isUndefined(undefined));
	});

	it('should provide merge functionality', function () {
		assert.deepEqual(Utils.merge({ 'one' : 'one'}, { 'two': 'two' }), { 'one' : 'one', 'two': 'two' });
	});

	it('should provide encode functionality', function () {
		assert.equal(Utils.encode('http://www.ft.com?foo=bar&testing=yay!'), "http%3A%2F%2Fwww.ft.com%3Ffoo%3Dbar%26testing%3Dyay!");
	});

	it('should provide guid generation', function () {
		const guid = Utils.guid();
		const re = /^\w{25}$/; // cifnulwv2000030ds4avpbm9f
		assert.ok(re.test(guid), 'Guid ' + guid + 'should match ' + /^\w{25}$/);
	});

	describe('internal page event', function () {
		const callback = sinon.spy();

		it('should provide onPage functionality', function () {
			assert.doesNotThrow(function () {
				Utils.onPage(callback);
			});
		});

		it('should call the callback when page is triggered', function () {
			Utils.triggerPage();
			assert.ok(callback.called, 'callback was triggered.');
		});
	});

	it('should provide getValueFromCookie functionality', function () {
		assert.ok(Utils.getValueFromCookie);
	});

	it('should provide getValueFromUrl functionality', function () {
		assert.ok(Utils.getValueFromUrl);
	});

	it('should provide getValueFromJsVariable functionality', function () {
		assert.ok(Utils.getValueFromJsVariable);
	});

	describe.only('getDomPath', function () {
		function getDomPath (string, selector) {
			string = '#test-dom>' + string;
			let out = '';
			let indent = 0;
			string.split('').forEach(char => {
				if (char === '|') {
					out += `\n${Array(indent + 1).join(' ')}`
				} else if (char === '>') {
					indent++
					out += `\n${Array(indent + 1).join(' ')}`
				} else if (char === ':') {
					indent--
					out += `\n${Array(indent + 1).join(' ')}`
				} else {
					out += char;
				}
			});
			document.body.insertAdjacentHTML('beforeend', jade.render(out))
			console.log(document.querySelector('#test-dom ' + selector))
			return Utils.getDomPath(document.querySelector('#test-dom ' + selector)).join('|');
		}

		it('possible to configure to get entire dom tree', function () {
			Utils.setDomPathConfig({
				includeAllNodes: true
			})
			assert.equal(getDomPath('div|p>a:p>a#link', '#link'), 'div[1]|p[2]|a[1]:link');
		})
	})

});
