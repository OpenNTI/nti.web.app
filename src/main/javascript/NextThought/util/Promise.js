/** force our implementation for now. */
window.Promise = null;

//TODO: use native promises asap
window.Promise = window.Promise || (function(Global) {

	//<editor-fold desc="Private shared methods">
	function then(onFulfilled, onRejected) {
		var chain = onFulfilled && onFulfilled.then ? onFulfilled : null,
			promise = chain || PromiseFactory.make(),
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
						changeState(obj.promise, State.FULFILLED, value);
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

	var nextId = 1, Cls, p, State = { PENDING: 0, FULFILLED: 1, REJECTED: 2 };

	Cls = function(worker) {
		this.id = (nextId++);
		this.state = State.PENDING;

		if (worker) {
			try {
				worker.call(Global, fulfill.bind(this), reject.bind(this));
			} catch (e) {
				reject.call(this, e);
			}
		} else {
			//The spec expects the constructor of a promise to take a callback that will do the work... our implementation was not so contained. We have more
			// of a Deffered promise model. Where we get an empty Promise object and externally fulfill/reject it.
			console.debug('No callback This invocation will break with native Promises');
		}
	};

	p = Cls.prototype;

	p.then = then;

	return Cls;
}(window));


Ext.applyIf(Promise.prototype, {
	done: function(fn) { this.validateHandler(fn); return this.then(fn); },
	fail: function(fn) { this.validateHandler(fn); return this.then(undefined, fn); },
	always: function(fn) {this.validateHandler(fn); return this.then(fn, fn); },
	validateHandler: function(fn) { if (typeof fn !== 'function') { throw new TypeError('Expected a function'); } },

	replace: function(oldPromise) {
		if (this.state === 0) {
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
 * The standard calls this "all"...
 * TODO: refactor to name this "all" and only define it if it is not already defined.
 * @return {Promise}
 */
Promise.pool = function() {
	// get promises
	var promises = [].slice.call(arguments, 0),
		values = [],
		state = 'fulfill',
		toGo = promises.length, i,
	// promise to return
		promise = PromiseFactory.make();


	if (Object.prototype.toString.call(promises[0]) === '[object Array]') {
		promises = promises[0];
		toGo = promises.length;
	}

	values.length = promises.length;


	// whenever a promise completes
	function checkFinished() {
		// check if all the promises have returned
		if (toGo) {
			return;
		}
		// set the state with all values if all are complete
		promise[state](values);
	}

	function prime(index) {
		var p = promises[index];

		if (!p || !p.then) {//handle falsy/non-promise @ index
			toGo--;
			checkFinished();
			return;
		}

		p.then(function(value) {
			// on success
			values[index] = value;
			toGo--;
			checkFinished();
		}, function(value) {
			// on error
			values[index] = value;
			toGo--;
			// set error state
			state = 'reject';
			checkFinished();
		});
	}

	checkFinished();//handle empty array.

	// whenever a promise finishes check to see if they're all finished
	for (i = 0; i < promises.length; i++) {
		prime(i);
	}

	// promise at the end
	return promise;
};




Ext.define('NextThought.util.Promise', {
	singleton: true,

	make: function() {
		var o = {state: 0},
		//because we used a "deferred" promise model (fulfullment/rejection happens externally) we have to construct it and bring the fulfull/reject
		// functions to the surface.
			p = new Promise(function(f, r) {
				function clean(i) {
					delete p.fulfill; delete o.fulfill;
					delete p.reject; delete o.reject;
					p.state = i; o.state = i;
				}

				o.fulfill = function(value) {f(value); clean(1);};
				o.reject = function(reason) {r(reason); clean(2);};
			});

		Ext.applyIf(p, o);

		return p;
	}

}, function() { window.PromiseFactory = this; });

