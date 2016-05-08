'use strict';

const assert = require('assert');
const pathToRx = require('path-to-regexp');
function isGenerator (fn) {
	return 'function' === typeof fn && fn.constructor.name == 'GeneratorFunction';
}
function isFunction (fn) {
	return 'function' === typeof fn && fn.constructor.name == 'Function';
}

class Container extends Map {
	constructor () {
		super();
		this.instances = new Map();
		this.factories = new Set();
		this.protected = new Set();
	}
	factory (fn) {
		// TODO: wrap generators in a service function
		assert(isFunction(fn), 'Service definition is not a function');
		this.factories.add(fn);
		return fn;
	}
	protect (fn) {
		assert(isFunction(fn), 'Value to protect must be a function');
		this.protected.add(fn);
		return fn;
	}
	get (key) {
		const value = super.get(key);
		if (isFunction(value) && !this.protected.has(value)) {
			if (this.instances.has(value)) {
				return this.instances.get(value);
			}
			else if (this.factories.has(value)) {
				return value(this);
			}
			else {
				const instance = value(this);
				this.instances.set(value, instance);
				return instance;
			}
		}
		return value;
	}
	raw (key) {
		return super.get(key);
	}
	extend (key, fn) {
		const prev = this.raw(key);
		assert(isFunction(prev), 'Cannot extend parameter');
		assert(isFunction(fn), 'Cannot extend service without a function');
		const next = c => fn(prev(c), c);
		this.set(key, next);
		if (this.factories.has(prev)) {
			this.factories.delete(prev);
			this.factories.add(next);
		}
	}

	register (provider) {
		provider.register(this);
	}

	match (pattern, values) {
		const params = [];
		const rx = pathToRx(pattern, params);
		const results = [];
		for (const key of this.keys()) {
			const m = rx.exec(key);
			if (m) {
				const match = {key};
				match.params = {};
				for (let i=0; i < params.length; i++) {
					match.params[params[i].name] = m[i + 1];
				}
				if (values) {
					match.value = this.get(key);
				}
				results.push(match);
			}
		}
		return results;
	}

	setdefault (key, value) {
		if (this.has(key)) {
			return this.get(key);
		}
		else {
			this.set(key, value);
			return this.get(key);
		}
	}

}

module.exports = Container;
