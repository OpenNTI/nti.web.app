Ext.define('NextThought.model.anchorables.ContentPointer', {
	config: {},

	statics: {
		createFromObject: function (o) {
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
