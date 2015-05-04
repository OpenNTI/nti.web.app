Ext.define('NextThought.app.course.overview.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview',

	title: 'Lessons',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	items: [
		{xtype: 'box', autoEl: {html: 'overview'}}
	],

	onActivate: function() {
		this.setTitle(this.title);
	},

	bundleChanged: function(bundle) {}
});
