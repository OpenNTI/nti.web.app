const Ext = require('@nti/extjs');
const { guidGenerator } = require('internal/legacy/util/Globals');

Object.assign(Promise.prototype, {
	always(fn) {
		return this.then(fn, fn);
	},
});

Object.assign(Promise, {
	wait: t => new Promise(f => setTimeout(f, t || 1)),

	/**
	 * Given a minimum duration, return a function that when called
	 * will return a promise that fulfills with its first arg after
	 * at least the duration given has passed.
	 *
	 * @param  {number} minWait the min time to wait
	 * @returns {Function} see description
	 */
	minWait(minWait) {
		const start = new Date();

		return result => {
			const end = new Date();
			const duration = end - start;

			if (duration < minWait) {
				return Promise.wait(minWait - duration).then(() => result);
			}

			return Promise.resolve(result);
		};
	},
});

/**
 * Deferred promise.
 * I guess there _MIGHT_ be some cases where we want this pattern. :/ I don't like it. But here you go.
 *
 * This will make a promise that you may or may NOT be able to keep.
 *	  -- There is no guarantee that fulfill or reject will get called.
 *
 * This version of the promise is no better than the callback-hell model.  Keep in mind that
 * Deferred's do not force execution of their promise, the are not Guaranteed to resolve.
 *
 * I strongly recommend examining your code and your structure before committing to using this as a final solution.
 */
global.Deferred = Promise.Deferred = (function () {
	function apply(d, src) {
		var k;
		for (k in src) {
			if (src.hasOwnProperty(k) && d[k] === undefined) {
				d[k] = src[k];
			}
		}
		return d;
	}

	function Deferred() {
		var o = false;
		function wtf(f, r) {
			o = {
				id: guidGenerator(),
				fulfill: function (value) {
					f(value);
				},
				reject: function (reason) {
					r(reason);
				},
			};
		}

		var p = new Promise(wtf);
		if (!o) {
			throw new Error('Contract broken!');
		}
		apply(p, o);
		return p;
	}

	return Deferred;
})();

global.Deferred.reject = (
	reason = new Error('Deferred.reject: No Reason Given')
) => ({
	then: (...args) => Promise.reject(reason).then(...args),
	catch: (...args) => Promise.reject(reason).catch(...args),
	finally: (...args) => Promise.reject(reason).finally(...args),
});

/**
 * Given an array of values, step through one at a time and fulfill with
 *	1.) The value its self if its not a function
 *	2.) The return value of the function
 *	3.) The success of the promise the function returns
 * if it returns a promise that fails, repeat with the next item
 *
 * @param  {Array} values An Array of values or functions that return value or a Promise.
 * @returns {Promise}	  fulfills with the first successful value in the array or rejects if none are.
 */
Promise.first =
	Promise.first ||
	function (values) {
		if (!Array.isArray(values) || !values.length) {
			return Promise.reject('No promise');
		}

		return new Promise(function (fulfill, reject) {
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
					val.then(fulfill).catch(function (reason) {
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

module.exports = exports = Promise;
Ext.define('NextThought.util.Promise', {});
