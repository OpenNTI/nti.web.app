Ext.define('NextThought.model.anchorables.ContentPointer', {
	config: {},

	statics: {
		createFromObject: function(o){
			var cp = NextThought.model.anchorables[o.Class];
			return cp.createFromObject(o);
		}
	},

	constructor: function(o) {
		this.initConfig(o);
		this.Class = 'ContentPointer';
		return this;
	},

	onClassExtended: function(cls, data, hooks) {
		Ext.merge(data.config, Ext.clone(cls.prototype.superclass.config));
	}
});
