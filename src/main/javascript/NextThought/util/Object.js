Ext.define('NextThought.util.Object', {
	alternateClassName: 'ObjectUtils',
	singleton: true,


	deleteFunctionProperties: function deleteFunctionsOn(o, allowClassRefs) {
		var key;
		//let the functions go, free up some captured scopes
		for (key in o) {
			if (o.hasOwnProperty(key)) {
				if (Ext.isFunction(o[key])) {
					delete o[key];
				} else if (o[key] && o[key].$className && allowClassRefs !== true) {
					o[key] = 'ref to a ' + o[key].$className;
				} else if (Ext.isObject(o[key]) && !o[key].$className) {
					deleteFunctionsOn(o[key], allowClassRefs);
				}
			}
		}
	},


	defineAttributes: function(obj, attrs) {
		var setter = '__defineSetter__',
			getter = '__defineGetter__',
			hasDefineProp = Boolean(Object.defineProperty),
			a, g, c, s, e = function() {};

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
},function() {
	window.ObjectUtils = this;
});
