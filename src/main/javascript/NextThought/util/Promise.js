/** force our implementation for now. */
window.Promise = null;

//TODO: Adapt these node.js tests to our platform so we can unit test our promise polyfill. https://github.com/promises-aplus/promises-tests

//TODO: use native promises asap
Promise = window.Promise || (function(global) {

	//<editor-fold desc="Private shared methods">
	function then(onFulfilled, onRejected) {
		var chain = onFulfilled && onFulfilled.then ? onFulfilled : null,
			promise = chain || new Promise(WHEN_THEN),
			me = this;

		if (chain) {
			onFulfilled = undefined;//don't set it as a function in the cache
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
			throw new Error('Cannot transition to same state: ' + state);
		}

		// trying to change out of fulfilled or rejected
		if (this.state === State.FULFILLED || this.state === State.REJECTED) {
			throw new Error('cannot transition from current state: ' + state);
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
					console.error('Exception while resolving promise:', error.stack || error.message || error);
					changeState.call(obj.promise, State.REJECTED, error);
				}
			}
		}
	}
	//</editor-fold>

	var WHEN_THEN = {},
		nextId = 1, Cls, p, State = { PENDING: 0, FULFILLED: 1, REJECTED: 2 };

	Cls = function(worker) {
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
			// of a Deffered promise model. Where we get an empty Promise object and externally fulfill/reject it.
			console.error('No callback This invocation will break with native Promises');
		}
	};

	p = Cls.prototype;

	p.then = then;

	return Cls;
}(window));


Ext.applyIf(Promise.prototype, {
	done: function(fn) { this.validateHandler(fn); return this.then(fn); },
	fail: function(fn) { this.validateHandler(fn); return this.then(undefined, fn); },
	//the proper name is 'catch', however JSLint has a problem with that (reserved word and all) so lets keep using "fail".
	//this is only here to be compliant to the api.
	'catch': function(fn) { return this.fail.apply(this, arguments); },
	always: function(fn) {this.validateHandler(fn); return this.then(fn, fn); },
	validateHandler: function(fn) { if (typeof fn !== 'function') { throw new TypeError('Expected a function'); } },

	replace: function(oldPromise) {
		console.deprecated('[Bad Practice!] Promises that need replacing need to be rejected with a "reason" of "replace" and remade.');
		if (oldPromise.state === 0 && oldPromise.fulfill && oldPromise.reject) {
			this.then(
					oldPromise.fulfill.bind(oldPromise),
					oldPromise.reject.bind(oldPromise)
			);
		}
	}
});


Ext.applyIf(Promise, {
	resolve: function(v) { return new Promise(function(f) {f.call(this, v);}); },
	reject: function(v) { return new Promise(function(f, r) {r.call(this, v);}); }
});


/**
 * Deffered promise.
 * I guess there _MIGHT_ be some cases where we want this pattern. :/ I don't like it. But here you go.
 *
 * This will make a promise that you may or may NOT be able to keep.
 *    -- There is no guarantee that fulfill or reject will get called.
 *
 * This version of the promise is no better than the callback-hell model.  Keep in mind that
 * Deffered's do not force execution of their promise, the are not Guaranteed to resolve.
 *
 * I strongly recommend examining your code and your structure before commiting to using this as a final solution.
 */
Ext.define('Deffered', {
	extend: 'Promise',

	constructor: function() {
		var p = this;

		function wtf(f, r) {
			p.fulfill = function(value) {f(value);};
			p.reject = function(reason) {r(reason);};
		}

		this.callParent([wtf]);
	}
});


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
 * Not sure we need this flexibility. Most the places we call this use the Array arg.
 *
 * @param {...Promise|Promise[]} var_args
 * @return {Promise}
 */
Promise.pool = function(var_args) {
	var waitOn = var_args;
	if (Object.prototype.toString.call(var_args) !== '[object Array]') {
		waitOn = Array.prototype.slice.call(arguments);
	}

	return Promise.all(waitOn);
};


Ext.define('NextThought.util.Promise', {
	singleton: true,

	make: function() {
		console.deprecated('[Bad Practice!] Promises should be not made without a guarantee. See this line.');
		/**
		 * Do NOT just replace .make() with "new Deffered()". Actually take the time to evaluate.
		 *
		 * Prferred pattern ex:
		 * new Promise(function (fulfill, reject) {//the Guarantee
		 *     //do something async here
		 *     ajax(somerequest)
		 *          .then(process)
		 *          .done(function(procesResults) {
		 *              fullfill(procesResults);
		 *          })
		 *          .fail(reject);
		 * });
		 */
		return new Deffered();
	}

}, function() { window.PromiseFactory = this; });

