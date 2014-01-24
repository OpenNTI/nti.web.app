Ext.define('NextThought.overrides.builtins.Number', {});

(function() {
	Ext.applyIf(Number.prototype, {
		pad: function(size) {
			if (typeof size !== 'number') {size = 2;}
			var s = String(this);
			while (s.length < size) {s = '0' + s;}
			return s;
		}
	});
}());
