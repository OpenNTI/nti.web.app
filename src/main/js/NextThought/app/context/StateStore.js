Ext.define('NextThought.app.context.StateStore', {
	extend: 'NextThought.common.StateStore',

	setContext: function(context) {
		this.current_context = context;
	},


	getContext: function() {
		return this.current_context || [];
	}
});
