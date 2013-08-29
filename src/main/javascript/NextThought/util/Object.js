Ext.define('NextThought.util.Object', {
	alternateClassName: 'ObjectUtils',
	singleton:          true,

	defineAttributes: function (obj, attrs) {
		var setter = '__defineSetter__',
				getter = '__defineGetter__',
				hasDefineProp = Boolean(Object.defineProperty),
				a, g, c, s, e = function () {};

		for (a in attrs) {
			if (attrs.hasOwnProperty(a)) {
				g = attrs[a].getter || e;
				s = attrs[a].setter || e;
				c = attrs[a].configurable || false;

				if (hasDefineProp) {
					Object.defineProperty(obj, a, { configurable: c, enumerable: true, set: s, get: g });
				}
				else {
					obj[setter](a, s);
					obj[getter](a, g);
				}
			}
		}
	}
}, function () {
	window.ObjectUtils = this;
});
