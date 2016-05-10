'use strict';

const Application = require('koa');
const co = require('co');
const util = require('util');
const compose = require('koa-compose');
const delegate = require('delegates');
const Lazybox = require('lazybox');

function isPlainFunction (fn) {
	return 'function' === typeof fn && 'Function' === fn.constructor.name;
}
function isGenerator (fn) {
	return 'function' === typeof fn && 'GeneratorFunction' === fn.constructor.name;
}

function Cokoa () {
	if (!(this instanceof Cokoa)) return new Cokoa();
	Application.apply(this);
	this.container = new Lazybox();
	this.bundles = [];
}

util.inherits(Cokoa, Application);

Cokoa.prototype.register = function registerBundle (bundle, params) {
	if (isPlainFunction(bundle)) {
		bundle = {register: bundle};
	}

	if (isPlainFunction(bundle.register)) {
		this.container.register(bundle, params);
	}

	let run = bundle.run;
	if (isPlainFunction(run)) {
		run = run(this);
	}

	if (isGenerator(run)) {
		this.bundles.push(run);
	}

	return this;
};

Cokoa.prototype.run = function run () {
	return co(compose(this.bundles)).then(() => this);
};

delegate(Cokoa.prototype, 'container')
	.method('get')
	.method('set')
	.method('define')
	.method('has')
	.method('delete')
	.method('rebase')
	.method('extend')
	.method('match')
	.method('setdefault');

module.exports = Cokoa;
