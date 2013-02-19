Ext.define('NextThought.view.contacts.TabPanel',{
	extend: 'Ext.tab.Panel',
	alias: 'widget.contacts-tabs',
	requires: [
		'NextThought.view.contacts.Panel'
	],

	defaultType: 'contacts-tabs-panel',
	plain: true,
	ui: 'contacts',
	minWidth: 550,

	tabBar: {
		plain: true,
		baseCls: 'nti',
		ui: 'contacts-tabbar',
		defaults: { plain: true, ui: 'contacts-tab' },
		xhooks: {
			afterRender: function(){
				this.callParent(arguments);
				this.searchButtonEl = Ext.DomHelper.append(this.el,{cls: 'search'},true);
			}
		}
	}
});
