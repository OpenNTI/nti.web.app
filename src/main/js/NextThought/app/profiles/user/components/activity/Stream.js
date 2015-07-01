Ext.define('NextThought.app.profiles.user.components.activity.Stream', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-user-activity',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},


	items: [
		{
			xtye: 'box',
			autoEl: {html: 'Activity'}
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();
	}
});