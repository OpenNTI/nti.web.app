Ext.define('NextThought.app.course.overview.components.editing.outlinenode.Editor', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-outlinenode-editor',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [
		{xtype: 'box', autoEl: {html: 'Outline Node Editor'}}
	],


	editOutlineNode: function(record) {
		return Promise.resolve();
	}
});
