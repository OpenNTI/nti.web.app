Ext.define('NextThought.view.account.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.account-view',

	iconCls: 'account',
	tabConfig: {tooltip: 'My Account'},
	ui: 'account',
	cls: 'account-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'My Account'}},
		{
			xtype: 'container',
			flex: 1,
			autoScroll: true,
			layout: 'auto',//{ type: 'vbox', align: 'stretch' },
			defaults: {
				xtype: 'box',
				autoEl: 'a',
				cls: 'item',
				isMenuItem: true,
				listeners: {
					afterRender: function(i) {
						i.mon(i.el, 'click', function() {i.fireEvent('click', i);},i);
					}
				}
			},
			items: [
			{html: ' ', autoEl: 'div'}
			]
		}
	]
});
