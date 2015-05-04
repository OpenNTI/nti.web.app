Ext.define('NextThought.app.course.forum.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-forum',

	title: 'Discussions',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	statics: {
		showTab: function(bundle) {
			return true
		}
	},

	items: [
		{xtype: 'box', autoEl: {html: 'forums'}}
	],

	onActivate: function() {
		this.setTitle(this.title);
	},

	bundleChanged: function(bundle) {}
})