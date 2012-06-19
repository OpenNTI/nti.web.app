Ext.define('NextThought.model.anchorables.ContentRangeDescription', {
	mixins: {
		JSONValue: 'NextThought.mixins.JSONValue'
	},

	config: {},

	constructor: function(o) {
		this.initConfig(o);
		this.Class = 'ContentRangeDescription';
		return this;
	},

	statics: {
		createFromObject: function(o){
			var cp = NextThought.model.anchorables[o.Class];
			//special case if it's a base class
			if (o.Class === 'ContentRangeDescription') {
				return cp.create({});
			}
			return cp.createFromObject(o);
		}
	}
});