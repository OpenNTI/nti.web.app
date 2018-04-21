const Ext = require('@nti/extjs');

require('legacy/mixins/JSONValue');


module.exports = exports = Ext.define('NextThought.model.anchorables.ContentRangeDescription', {
	mixins: {
		JSONValue: 'NextThought.mixins.JSONValue'
	},

	config: {},

	isEmpty: true,

	constructor: function (o) {
		this.initConfig(o);
		this.Class = 'ContentRangeDescription';
		this.MimeType = this.mimeType;
	},

	onClassExtended: function (data, cls) {
		var mime = {mimeType: 'application/vnd.nextthought.contentrange.' + data.$className.split('.').pop().toLowerCase()};
		Ext.applyIf(cls, mime);//Allow overriding
		Ext.applyIf(data, mime);//Allow overriding
	},

	statics: {
		createFromObject: function (o) {
			//This should be rewritten to create an array at the top of the file instead
			//Tof using the "Magic" ExtJS class namespace object...
			//eslint-disable-next-line no-undef
			var cp = NextThought.model.anchorables[o.Class];
			//special case if it's a base class
			if (o.Class === 'ContentRangeDescription') {
				return cp.create({});
			}
			return cp.createFromObject(o);
		}
	},

	locatorKey: function () {
		return '_locator';
	},

	attachLocator: function (loc) {
		if (!loc) {
			delete this[this.locatorKey()];
		}
		else {
			this[this.locatorKey()] = loc;
		}
	},

	locator: function () {
		return this[this.locatorKey()];
	}
});
