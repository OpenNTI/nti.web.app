const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.overrides.builtins.RegExp',
	{}
);

Object.assign(RegExp, {
	escape: function me(text) {
		if (!me.Re) {
			me.Re = /[-[\]{}()*+?.,\\^$|#\s]/g;
		}
		return text.replace(me.Re, '\\$&');
	},
});
