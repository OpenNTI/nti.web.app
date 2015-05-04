Ext.define('NextThought.app.course.info.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info',

	title: '',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	items: [
		{xtype: 'box', autoEl: {html: 'info'}}
	],

	onActivate: function() {
		this.setTitle(this.title);
	},

	bundleChanged: function(bundle) {}
});
