Ext.define('NextThought.view.profiles.parts.Notifications', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.profile-notifications',

	requires: ['NextThought.view.account.notifications.Panel'],

	cls: 'notifications-window',
	constrainTo: Ext.getBody(),
	layout: 'fit',
	width: 520,
	height: 500,
	modal: true,
	header: false,

	items: [
		{
			xtype: 'notifications-panel',
			rowHover: Ext.emptyFn
		}
	],

	dockedItems: {
		xtype: 'container',
		dock: 'bottom',
		ui: 'footer',
		height: 55,
		baseCls: 'nti-window',
		layout: {
			type: 'hbox',
			align: 'stretchmax'
		},
		defaults: {
			cls: 'footer-region',
			xtype: 'container',
			flex: 1,
			layout: 'hbox'
		},
		items: [{
			layout: 'auto',
			defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
			items: [
				//{text: 'Save', cls: 'x-btn-flat-large save', action: 'save', href: '{url}', style: { float: 'left'}},
				// { xtype: 'box', cls: 'iframe-save', save: true, autoEl: { tag: 'a', href: '{url}', html: 'Save', target: '_blank'}},
				{
					text: 'Close',
					cls: 'x-btn-blue-large dismiss',
					action: 'cancel',
					style: { 'float': 'right'},
					handler: function(b, e) {
						e.stopEvent(); b.up('window').close();
					}
				}
			]
		}]
	},


	initComponent: function() {
		this.callParent(arguments);
		var me = this;
			panel = this.down('notifications-panel');

		panel.rowClicked = Ext.Function.createSequence(panel.rowClicked, function() {
			me.close();
		});

		this.setTitle('Notifications');
	}
});
