Ext.define('NextThought.app.context.StateStore', {
	extend: 'NextThought.common.StateStore',

	setContext: function(context) {
		this.current_context = context;
	},


	getContext: function() {
		return this.current_context || [];
	},


	getRootBundle: function() {
		var context = this.current_context,
			i, x;

		for (i = 0; i < context.length; i++) {
			x = context[i];

			if (x.obj && x.obj.isBundle) {
				return x.obj;
			}
		}
	}
});
