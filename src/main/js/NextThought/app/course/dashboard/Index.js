Ext.define('NextThought.app.course.dashboard.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-dashboard',

	title: 'Activity',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	items: [
		{xtype: 'box', autoEl: {html: 'dashboard'}}
	],

	onActivate: function() {
		this.setTitle(this.title);
	},


	bundleChanged: function(bundle) {}
});
