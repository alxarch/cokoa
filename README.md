# cokoa

Koa meets dependency injection container

## Usage

```js

var app = require('cokoa')();

// Delegates to app.container.set()
app.set('db.host', 'localhost');
// Delegates to app.container.get()
app.get('db.host');
app.set('service', (c) => {
	// c is app.container
	return new Service();
});

// But real fun starts by registering a bundle
let bundle = {
	register: (c) => {
		c.set('foo.bar', 'bar');
		c.define('foo', ['foo.bar', (bar) => {
			console.log('Lazy load!');
			return {
				bar: () => bar
			};
		}]);
	},
	run: (app) => {
		return function *(next) {
			console.log('A');
			app.context.foo = app.get('foo');
			console.log(foo.bar());
			yield next;
			console.log('B');
		}
	}
};

app.register(bundle, {
	'foo.bar': 'baz'
});
// app.container.get('foo.bar') == 'baz'
app.register({
	register: (c) => {
		c.set('foo.bar', 'foo');
	},
	run: (c) => {
		return function *(next) {
			console.log('C');
			yield next;
			console.log('D');
		}
	}
});
// app.container.get('foo.bar') == 'foo'

app.run().then((app) => {
	console.log('done');
	console.log(app.context.foo.bar());
});

// Will log
// > A
// > Lazy load!
// > bar
// > C
// > D
// > B
// > done
// > foo

```

