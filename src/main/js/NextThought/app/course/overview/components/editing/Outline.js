Ext.define('NextThought.app.course.overview.components.editing.Outline', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outline',

	layout: 'none',

	items: [
		{
			xtype: 'box',
			autoEl: {html: 'Outline Editor'}
		}
	],


	setActiveBundle: function(bundle) {},

	editOutline: function() {
		return Promise.resolve();
	}
});
