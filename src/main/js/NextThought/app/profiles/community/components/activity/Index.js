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


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showActivity.bind(this));

		this.addDefaultRoute('/');
	},


	setSourceURL: function(url) {},


	showActivity: function(route, subRoute) {
		this.setTitle('Activity');
	}
});
