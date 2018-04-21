const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.model.anchorables.ContentPointer', {
	config: {},

	statics: {
		createFromObject: function (o) {
			//This should be rewritten to create an array at the top of the file instead
			//Tof using the "Magic" ExtJS class namespace object...
			//eslint-disable-next-line no-undef
			var cp = NextThought.model.anchorables[o.Class];
			return cp.createFromObject(o);
		}
	},

	constructor: function (o) {
		this.initConfig(o);
		this.Class = 'ContentPointer';
		this.MimeType = this.mimeType;
	},

	onClassExtended: function (cls, data, hooks) {
		Ext.merge(data.config, Ext.clone(cls.prototype.superclass.config));
		var mime = {mimeType: 'application/vnd.nextthought.contentrange.' + data.$className.split('.').pop().toLowerCase()};
		Ext.applyIf(cls, mime);
		Ext.applyIf(data, mime);
	}
});
