/**
 *  Well crap. These are now starting to pop up in browsers. (Chrome 34 dev has it, and collides with our name...) I was trying to get some tests to work in
 *  Karma, and noticed we were getting a "TypeError: Promise constructor takes a function argument"... that was odd to me becasue our Promise class did not take
 *  any arguments in the constructor... so that lead me to discover Futures have been given a global name "Promise" and that our implementation almost exactly
 *  matches except for the constructor. The standard has a callback to do all the work then reject/fulfill within. :/ Ours, you construct the Promise and return
 *  turn it while you do your work asynchronously. Grr.
 *
 *
 *  See: http://www.html5rocks.com/en/tutorials/es6/promises/
 *
 *  All that to say, I'm blanking out the global version so we don't get the error.
 */

//Heavily influenced by http://modernjavascript.blogspot.com/2013/08/promisesa-understanding-by-doing.html
window.Promise = (function(Global) {

	function then(onFulfilled, onRejected) {
		var chain = onFulfilled && onFulfilled.then ? onFulfilled : null,
			promise = chain || new Promise(),
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

	var nextId = 1, Cls, p, State = { PENDING: 0, FULFILLED: 1, REJECTED: 2 };

	Cls = function(worker) {
		this.id = (nextId++);
		this.state = State.PENDING;

		if (worker) {
			setTimeout(worker.bind(Global, fulfill.bind(this), reject.bind(this)), 0);
		} else {
			console.error('No callback');
		}
	};

	p = Cls.prototype;
	p.isResolved = function() { return this.state !== State.PENDING; };

	p.then = then;

	p.done = function(fn) { this.validateHandler(fn); return this.then(fn); };
	p.fail = function(fn) { this.validateHandler(fn); return this.then(undefined, fn); };
	p.always = function(fn) {this.validateHandler(fn); return this.then(fn, fn); };
	p.validateHandler = function(fn) { if (typeof fn !== 'function') { throw new TypeError('Expected a function'); } };


	p.fulfill = fulfill;
	p.reject = reject;

	Cls.State = p.State = State;


	Cls.pool = function() {
		// get promises
		var promises = [].slice.call(arguments, 0),
			values = [],
			state = 'fulfill',
			toGo = promises.length, i,
		// promise to return
			promise = new Promise();


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


	return Cls;
}(window));


Ext.define('NextThought.util.Promise', {});
