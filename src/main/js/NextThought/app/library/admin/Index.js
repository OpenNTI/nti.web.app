Ext.define('NextThought.app.library.admin.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-admin',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [{xtype: 'box', autoEl: {html: 'Admin'}}]
});
