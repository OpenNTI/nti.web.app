Ext.define('NextThought.view.SecondaryTabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.secondary-tabpanel',

	plain: true,
	ui: 'secondary-tabpanel',
	flex: 1,

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'secondary-tabbar',
		defaults: { plain: true, ui: 'secondary-tab' },

		xhooks: {
			initComponent: function(){
				this.callParent(arguments);
				this.layout.pack = 'center';
			}
		}
	}

});
