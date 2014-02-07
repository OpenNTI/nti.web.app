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
window.Promise = (function() {
	var State = {
		PENDING: 0,
		FULFILLED: 1,
		REJECTED: 2
	},
	nextId = 1,
	p =	function p() {

		function getCtx() {
			try {
				if (ctx === p.pool) {
					ctx = ctx.caller;
				}
				var c = ((ctx.$owner && ctx.$owner.$className) || '') + '#' + (ctx.$name || '');
				if (c === '#') {
					c = ctx.toString();
				}
				return c;
			} catch (e) {}
		}

		var ctx = p.caller,
			Promise;

		Promise = {
				//ctx: getCtx(),
				State: State,//handy ref
				state: State.PENDING,

				isResolved: function() { return this.state !== State.PENDING; },

				changeState: function(state, value) {
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
					this.resolve();
					return this.state;
				},


				fulfill: function(value) { this.changeState(State.FULFILLED, value); },
				reject: function(reason) { this.changeState(State.REJECTED, reason); },


				then: function(onFulfilled, onRejected) {

					var chain = onFulfilled && onFulfilled.then ? onFulfilled : null,
						promise = chain || Object.create(Promise),
						me = this;

					if (chain) {
						onFulfilled = undefined;//don't set it as a function in the cache
					}

					// initialize array
					me.cache = me.cache || [];

					this.async(function() {
						me.cache.push({
							fulfill: onFulfilled,
							reject: onRejected,
							promise: promise
						});
						me.resolve();
					});

					return promise;
				},


				hasHandler: function(name) {
					var me = this,
						i = (me.cache || []).length - 1, c,
						has = false;
					for (i; i >= 0 && !has; i--) {
						c = me.cache[i];
						has = typeof c[name] === 'function' || c.hasHandler(name);
					}

					return has;
				},

				maybeReportError: function(obj, error) {
					var me = this, id = me.id, ctx = me.ctx;
					setTimeout(function() {
						if (!obj.promise.hasHandler('reject')) {
							console.error('POTENTIALLY UNHANDLED EXECPTION:', id, error, ctx);
						}
					}, 1000);
				},


				done: function(fn) { this.validateHandler(fn); return this.then(fn); },
				fail: function(fn) { this.validateHandler(fn); return this.then(undefined, fn); },
				always: function(fn) {this.validateHandler(fn); return this.then(fn, fn); },

				validateHandler: function(fn) {
					if (typeof fn !== 'function') {
						throw new TypeError('Expected a function');
					}
				},

				resolve: function() {
					var obj, fn, value, me = this;
					// check if pending
					if (this.state === State.PENDING) {
						return;
					}

					function chain(obj, state) {
						return function(v) {
							obj.promise.changeState(state, v);
						};
					}

					// for each 'then'
					while (me.cache && me.cache.length) {
						obj = me.cache.shift();

						fn = me.state === State.FULFILLED ? obj.fulfill : obj.reject;

						if (typeof fn !== 'function') {
							obj.promise.changeState(this.state, me.value);
						} else {
							// fulfill promise with value or reject with error
							try {
								value = fn(me.value);

								// deal with promise returned
								if (value && typeof value.then === 'function') {
									value.then(chain(obj, State.FULFILLED), chain(obj, State.REJECTED));
									// deal with other value returned
								} else {
									obj.promise.changeState(State.FULFILLED, value);
								}
								// deal with error thrown
							} catch (error) {
								me.maybeReportError(obj, error);
								obj.promise.changeState(State.REJECTED, error);
							}
						}
					}
				},


				async: function(fn) {
					setTimeout(fn, 5);
				}
			};

		return Object.create(Promise, {id: {value: nextId++}});
	};


	p.State = State;


	p.pool = function() {
		// get promises
		var promises = [].slice.call(arguments, 0),
			values = [],
			state = State.FULFILLED,
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
			promise.changeState(state, values);
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
				state = State.REJECTED;
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

	p.toPromise = function(fn) {
		return function() {

			// promise to return
			var promise = new Promise();

			//on error we want to reject the promise
			function errorFn(data) {
				promise.reject(data);
			}

			// fulfill on success
			function successFn(data) {
				promise.fulfill(data);
			}

			// run original function with the error and success functions
			// that will set the promise state when done
			fn.apply(this,
					[errorFn, successFn].concat([].slice.call(arguments, 0)));

			return promise;
		};
	};

	return p;
}());


Ext.define('NextThought.util.Promise', {});
