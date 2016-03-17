/** force our implementation for now. */
//TODO: don't use a custom promise
window.Promise = null;

//TODO: Adapt these node.js tests to our platform so we can unit test our promise polyfill. https://github.com/promises-aplus/promises-tests

//We won't use the native ones for now. (especially since we're in ES5 mode)
//See: http://www.html5rocks.com/en/tutorials/es6/promises/
Promise = window.Promise || (function(global) {

	//<editor-fold desc="Private shared methods">
	function then(onFulfilled, onRejected) {
		var promise = new Promise(WHEN_THEN),
			me = this;

		if (onFulfilled && onFulfilled.then) {
			Ext.Error.raise('Cannot `then` a promise with another promise this way.');
		}

		// initialize array
		me.cache = me.cache || [];

		setTimeout(function() {//async it
			me.cache.push({
				fulfill: onFulfilled,
				reject: onRejected,
				promise: promise
			});
			resolve.call(me);
		}, 1);

		return promise;
	}

	function changeState(state, value) {
		// catch changing to same state (perhaps trying to change the value)
		if (this.state === state) {
			console.error('Cannot transition to same state: ' + state);
			return;
		}

		// trying to change out of fulfilled or rejected
		if (this.state === State.FULFILLED || this.state === State.REJECTED) {
			console.error('cannot transition from current state: ' + state);
			return;
		}

		// if second argument isn't given at all (passing undefined allowed)
		if (state === State.FULFILLED && arguments.length < 2) {
			throw new Error('transition to fulfilled must have a non null value');
		}

		// if a null reason is passed in
		if (state === State.REJECTED && value === null) {
			throw new Error('transition to rejected must have a non null reason');
		}

		//change state
		this.state = state;
		this.value = value;
		resolve.call(this);
		return this.state;
	}

	function fulfill(value) { changeState.call(this, State.FULFILLED, value); }
	function reject(reason) { changeState.call(this, State.REJECTED, reason); }

	function resolve() {
		var obj, fn, value, me = this;
		// check if pending
		if (this.state === State.PENDING) {
			return;
		}

		function chain(obj, state) {
			return function(v) {
				changeState.call(obj.promise, state, v);
			};
		}

		// for each 'then'
		while (me.cache && me.cache.length) {
			obj = me.cache.shift();

			fn = me.state === State.FULFILLED ? obj.fulfill : obj.reject;

			if (typeof fn !== 'function') {
				changeState.call(obj.promise, this.state, me.value);
			} else {
				// fulfill promise with value or reject with error
				try {
					value = fn(me.value);

					// deal with promise returned
					if (value && typeof value.then === 'function') {
						value.then(chain(obj, State.FULFILLED), chain(obj, State.REJECTED));
						// deal with other value returned
					} else {
						changeState.call(obj.promise, State.FULFILLED, value);
					}
					// deal with error thrown
				} catch (error) {
					console.error('Exception while resolving promise:', error && (error.stack || error.message || error));
					changeState.call(obj.promise, State.REJECTED, error);
				}
			}
		}
	}
	//</editor-fold>

	var WHEN_THEN = {},
		nextId = 1, Promise, p, State = { PENDING: 0, FULFILLED: 1, REJECTED: 2 };

	Promise = function(worker) {
		this.id = (nextId++);
		this.state = State.PENDING;

		if (worker && worker.call) {
			try {
				worker.call(global, fulfill.bind(this), reject.bind(this));
			} catch (e) {
				reject.call(this, e);
			}
		} else if (worker !== WHEN_THEN) {
			//The spec expects the constructor of a promise to take a callback that will do the work... our implementation was not so contained. We have more
			// of a Deferred promise model. Where we get an empty Promise object and externally fulfill/reject it.
			console.error('No callback This invocation will break with native Promises');
		}
	};

	p = Promise.prototype;

	p.then = then;

	return Promise;
}(window));


Ext.applyIf(Promise.prototype, {
	done: function(fn) { this.validateHandler(fn); return this.then(fn); },
	fail: function(fn) { this.validateHandler(fn); return this.then(undefined, fn); },
	//the proper name is 'catch', however JSLint has a problem with that (reserved word and all) so lets keep using "fail".
	//this is only here to be compliant to the api.
	'catch': function(fn) { return this.fail.apply(this, arguments); },
	always: function(fn) {this.validateHandler(fn); return this.then(fn, fn); },
	chain: function(old) {this.then(function(o) {old.fulfill(o);},function(r) {old.reject(r);});},

	validateHandler: function(fn) { if (typeof fn !== 'function') { throw new TypeError('Expected a function'); } }
});


Ext.applyIf(Promise, {
	resolve: function(v) { return v instanceof Promise ? v : new Promise(function(f) {f.call(this, v);}); },
	reject: function(v) { return new Promise(function(f, r) {r.call(this, v);}); },
	wait: function(t) { return new Promise(function(f) {setTimeout(f, t || 1);});},
	/**
	 * Given a minimum duration, return a function that when called
	 * will return a promise that fulfills with its first arg after
	 * at least the duration given has passed.
	 *
	 * @param  {Number} minWait the min time to wait
	 * @return {Function}
	 */
	minWait: function(minWait) {
		var start = new Date();

		return function(result) {
			var end = new Date(),
				duration = end - start;

			if (duration < minWait) {
				return wait(minWait - duration)
					.then(function() {
						return result;
					});
			}

			return Promise.resolve(wait);
		}
	}
});

wait = Promise.wait;


/**
 * Deferred promise.
 * I guess there _MIGHT_ be some cases where we want this pattern. :/ I don't like it. But here you go.
 *
 * This will make a promise that you may or may NOT be able to keep.
 *    -- There is no guarantee that fulfill or reject will get called.
 *
 * This version of the promise is no better than the callback-hell model.  Keep in mind that
 * Deferred's do not force execution of their promise, the are not Guaranteed to resolve.
 *
 * I strongly recommend examining your code and your structure before commiting to using this as a final solution.
 */
Deferred = (function() {

	function apply(d, src) {
		var k;
		for (k in src) {
			if (src.hasOwnProperty(k) && d[k] === undefined) {
				d[k] = src[k];
			}
		}
		return d;
	}

	var Deferred = function() {
		var o = false;
		function wtf(f, r) {
			o = {
				fulfill: function(value) {f(value);},
				reject: function(reason) {r(reason);}
			};
		}

		this.superclass.constructor.call(this, wtf);
		if (!o) {
			throw new Error('Contract broken!');
		}
		apply(this, o);
	};

	Deferred.prototype.superclass = Promise.prototype;
	apply(Deferred.prototype, Promise.prototype);

	return Deferred;
}());


/**
 *
 * @param {Promise[]} promises
 * @type {Function}
 * @return {Promise}
 */
Promise.all = Promise.all || function(promises) {
	// get promises
	var values = [],
		toGo = promises.length, i;

	values.length = promises.length;

	return new Promise(function(fulfill, reject) {
		var state = fulfill;

		// whenever a promise completes
		function checkFinished() {
			// check if all the promises have returned
			if (toGo) {
				return;
			}
			// set the state with all values if all are complete
			state(values);
		}

		function prime(index) {
			var p = promises[index];

			function done(value) {
				values[index] = value;
				toGo--;
				checkFinished();
			}

			if (!p || !p.then) {//handle falsy/non-promise @ index
				done(p);
				return;
			}

			p.then(done,// on success
					function(v) {
						state = reject;
						done(v);
					});
		}

		checkFinished();//handle empty array.

		// whenever a promise finishes check to see if they're all finished
		for (i = 0; i < promises.length; i++) {
			prime(i);
		}
	});
};


/**
 * Given an array of values, step through one at a time and fulfill with
 *	1.) The value its self if its not a function
 *	2.) The return value of the function
 *	3.) The success of the promise the function returns
 * if it returns a promise that fails, repeat with the next item
 *
 * @param  {Array} values An Array of values or functions that return value or a Promise.
 * @return {Promise}      fulfills with the first successful value in the array or rejects if none are.
 */
Promise.first = Promise.first || function(values) {
	if (!Ext.isArray(values) || !values.length) {
		return Promise.reject('No promise');
	}

	return new Promise(function(fulfill, reject) {
		var total = values.length;

		function add(index) {
			if (index >= total) {
				reject('No promise in chain was successful');
				return;
			}

			var val = values[index];

			if (!Ext.isFunction(val)) {
				fulfill(val);
				return;
			}

			val = val.call();

			if (val instanceof Promise) {
				val
					.then(fulfill)
					.fail(function(reason) {
						console.error('Promise in chain failed: ', reason);
						add(index + 1);
					});
			} else {
				fulfill(val);
			}
		}

		add(0);
	});
};


export default Ext.define('NextThought.util.Promise', {});
