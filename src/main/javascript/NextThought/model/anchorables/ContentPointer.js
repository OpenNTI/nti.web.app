Ext.define('NextThought.model.anchorables.ContentPointer', {

	config: {},

	constructor: function(o) {
		this.initConfig(o);
		return this;
	},

	onClassExtended: function(cls, data, hooks) {
		Ext.merge(data.config, Ext.clone(cls.prototype.superclass.config));
	}
});