Ext.define('NextThought.overrides.builtins.Array', {});

(function() {

	/** @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
	 *
	 * @param callback
	 * @param [initialValue]
	 * @return {*}
	 */
	function reduce(callback, initialValue) {
		'use strict';
		if (null === this || 'undefined' === typeof this) {
			// At the moment all modern browsers, that support strict mode, have
			// native implementation of Array.prototype.reduce. For instance, IE8
			// does not support strict mode, so this check is actually useless.
			throw new TypeError(
					'Array.prototype.reduce called on null or undefined');
		}
		if ('function' !== typeof callback) {
			throw new TypeError(callback + ' is not a function');
		}
		var index = 0, length = this.length >>> 0, value, isValueSet = false;
		if (1 < arguments.length) {
			value = initialValue;
			isValueSet = true;
		}
		for (; length > index; ++index) {
			if (!this.hasOwnProperty(index)) { continue; }
			if (isValueSet) {
				value = callback(value, this[index], index, this);
			} else {
				value = this[index];
				isValueSet = true;
			}
		}
		if (!isValueSet) {
			throw new TypeError('Reduce of empty array with no initial value');
		}
		return value;
	}


	(function(o,a) {
		Ext.Object.each(a, function(k,v) {
			if (!o[k]) {
				o[k] = v;
				if (Object.defineProperty) {
					Object.defineProperty(o, k, {enumerable: false});
				}
			}
		});
	}(Array.prototype, {
		first: function first() { return this[0]; },
		last: function last() { return this[this.length - 1]; },
		peek: function peek() { return this[this.length - 1]; },
		reduce: reduce
	}));

}());
