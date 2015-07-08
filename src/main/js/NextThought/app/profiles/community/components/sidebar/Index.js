Ext.define('NextThought.app.profiles.community.components.sidebar.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community-sidebar',

	layout: 'none',

	cls: 'community-sidebar',

	items: [
		{xtype: 'box', autoEl: {html: 'Side Bar'}}
	],


	updateEntity: function(entity) {}
});
