Ext.define('NextThought.app.library.communities.Current', {
	extend: 'NextThought.app.library.components.Current',
	alias: 'widget.library-current-communities',

	layout: 'none',
	title: 'Communities',

	statics: {
		shouldShow: function() {
			return true;
		}
	},

	items: [{xtype: 'box', autoEl: {html: 'Current Communities'}}]
});
