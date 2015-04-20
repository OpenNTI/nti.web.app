Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',

	layout: 'none',

	cls: 'main-body',

	items: [
		{xtype: 'box', autoEl: {html: 'Body'}}
	]
});
