Ext.define('NextThought.app.profiles.community.components.activity.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community-activity',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'community-activity',

	items: [
		{xtype: 'box', autoEl: {html: 'Activity'}}
	],


	setSourceURL: function(url) {}
});
