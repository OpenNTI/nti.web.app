const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.overrides.builtins.Number', {});

(function () {
	Ext.applyIf(Number.prototype, {
		pad: function (size) {
			if (typeof size !== 'number') {size = 2;}
			var s = String(this);
			while (s.length < size) {s = '0' + s;}
			return s;
		},
		isFloatEqual: function (b, precision) {
			precision = precision || 2;

			var zero = 0,
				ep = parseFloat(zero.toFixed(precision) + '1'); //produces 0.001

			return Math.abs(this - b) < ep;
		},
		isFloatGreaterThanOrEqual: function (b, precision) {
			return this.isFloatEqual(b, precision) || this > b;
		},
		isFloatLessThanOrEqual: function (b, precision) {
			return this.isFloatEqual(b, precision) || this < b;
		}
	});
}());
