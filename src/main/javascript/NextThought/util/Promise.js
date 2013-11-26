Ext.define('NextThought.util.Promise', {});
//Heavily influenced by http://modernjavascript.blogspot.com/2013/08/promisesa-understanding-by-doing.html
var Promise = (function() {
	var State = {
			PENDING: 0,
			FULFILLED: 1,
			REJECTED: 2
		},
		p =	function() {
			var Promise = {
				State: State,//handy ref
				state: State.PENDING,

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

					var promise = Object.create(Promise),
						me = this;

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
								obj.promise.changeState(State.REJECTED, error);
							}
						}
					}
				},


				async: function(fn) {
					setTimeout(fn, 5);
				}
			};

			return Object.create(Promise);
		};


	p.State = State;


	p.pool = function() {
		// get promises
		var promises = [].slice.call(arguments, 0),
			values = [],
			state = State.FULFILLED,
			toGo = promises.length, i,
		// promise to return
			promise = Object.create(Promise);

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
			promises[index].then(function(value) {
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
