Ext.define('NextThought.app.course.reports.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-reports',

	title: 'Reports',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	statics: {
		showTab: function(bundle) {
			return true
		}
	},

	items: [
		{xtype: 'box', autoEl: {html: 'reports'}}
	],

	onActivate: function() {
		this.setTitle(this.title);
	},

	bundleChanged: function(bundle) {}
});
