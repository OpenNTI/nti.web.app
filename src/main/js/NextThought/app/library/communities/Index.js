Ext.define('NextThought.app.library.communities.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-communities',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [{xtype: 'box', autoEl: {html: 'communities'}}]
});
