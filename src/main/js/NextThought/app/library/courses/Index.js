Ext.define('NextThought.app.library.courses.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-courses',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [{xtype: 'box', autoEl: {html: 'Courses'}}]
});
