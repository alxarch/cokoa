'use strict';

const assert = require('assert');

const Cokoa = require('.');
let cokoa = Cokoa();
assert(cokoa instanceof Cokoa, 'Is a Cokoa');
cokoa = new Cokoa();

// Cokoa#set()

// Simple get/set
cokoa.set('foo', 'bar');
assert.equal(cokoa.get('foo'), 'bar');

// Cokoa#setdefault()
assert.equal(cokoa.setdefault('foo', 'baz'), 'bar');
assert.equal(cokoa.setdefault('foo.bar', 'baz'), 'baz');
assert.equal(cokoa.get('foo.bar'), 'baz');

// Cokoa#match()

cokoa = new Cokoa();
cokoa.set('foo.bar.baz', 'foo');
cokoa.set('foo.bar', 'bar');
cokoa.set('baz.bar', 'foo');

const actual = [];
cokoa.match('foo.:bar.:baz?', (key, params) => actual.push({key, params}) );
assert.deepEqual(actual, [
	{
		key: 'foo.bar.baz',
		params: {
			bar: 'bar',
			baz: 'baz'
		}
	},
	{
		key: 'foo.bar',
		params: {
			bar: 'bar',
			baz: undefined
		}
	}
	
]);

// Cokoa#register()

assert.doesNotThrow(() => {
	cokoa.register(function (c) {});
});

cokoa.register(function (c) {
	c.set('bar', 'baz');
});

assert.equal(cokoa.get('bar'), 'baz');

cokoa.register(function (c) {
	c.set('baz', 'bar');
}, { baz: 'foo' });

assert.equal(cokoa.get('baz'), 'foo');

function *bundle (next) {
	yield next;
}
cokoa.register({ run: (c => bundle) });
assert.equal(cokoa.bundles[0], bundle);
