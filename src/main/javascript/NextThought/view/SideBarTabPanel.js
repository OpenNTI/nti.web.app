//SCSS in _sidebar.scss
Ext.define('NextThought.view.SideBarTab',{
	extend: 'Ext.tab.Tab',
	alias: 'widget.sidebar-tab',
	mixins: {
		isListening: 'NextThought.mixins.IsListening'
	},
	plain: true,
	ui: 'sidebar'
});


Ext.define('NextThought.view.SideBarTabPanel',{
	extend: 'Ext.tab.Panel',
	requires: [
		'Ext.layout.container.boxOverflow.None'
	],
	alias: 'widget.sidebar-tabpanel',
	ui: 'sidebar',
	plain: true,
	cls: 'sidebar-panel-container',
	stateful: true,
	stateEvents:['tabchange'],
	tabBar: {
		baseCls: 'sidebar-tab-bar',
		plain: true,
		ui: 'sidebar',
		xhooks: {
			initComponent: function(){
				this.callParent(arguments);
				this.layout.overflowHandler =
						new Ext.layout.container.boxOverflow.None(this.layout,{});
				this.layout.overflowHandler.scrollToItem = Ext.emptyFn;
			}
		}
	},

	onAdd: function(item, index){
		item.tabConfig = Ext.applyIf(item.tabConfig||{},{
			xtype: 'sidebar-tab'
		});
		return this.callParent([item,index]);
	},

	applyState: function(state){
		var t = (state||{}).t||0;

		this.setActiveTab(t);
	},

	getState: function(){
		return {t:this.items.indexOf(this.getActiveTab())};
	}
});
