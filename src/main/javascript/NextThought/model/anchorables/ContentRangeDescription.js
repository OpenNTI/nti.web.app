Ext.define('NextThought.model.anchorables.ContentRangeDescription', {
	mixins: {
		JSONValue: 'NextThought.mixins.JSONValue'
	},

	config: {},

	statics: {
		createFromObject: function(o){
			var cp = NextThought.model.anchorables[o.Class];
			return cp.createFromObject(o);
		}
	}
});