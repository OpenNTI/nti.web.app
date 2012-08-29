Ext.define('NextThought.view.account.Activity',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-view',
	requires:[
		'NextThought.view.account.ActivityItem'
	],

	iconCls: 'activity',

	ui: 'activity',
	cls: 'activity-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'Recent Activity'}},
		{
			xtype: 'container',
			flex: 1,
			autoScroll: true,
			layout: { type: 'vbox', align: 'stretch' },
			defaults: {
				xtype: 'activity-item'
			}
		}
	],

	initComponent: function(){
		this.callParent(arguments);
		this.container = this.down('container');
		this.store = Ext.getStore('Stream');
		this.mon(this.store,{
			scope: this,
			add: this.newActivity,
			datachanged: this.reloadActivity,
			clear: function(){console.log('clear',arguments);},
			remove: function(){console.log('remove',arguments);},
			update: function(){console.log('update',arguments);}
		});
	},

	reloadActivity: function(store){
		var container = this.container,
			items = [];

		function doGroup(group){
			var label = (group.name||'').substring(2);
			if(label){
				items.push({ xtype: 'box', html:label, cls: 'divider' });
			}
			Ext.each(group.children,function(c){items.push({change:c});});
		}

		Ext.each(store.getGroups(),doGroup,this);
		container.removeAll(true);
		container.add(items);
	},

	newActivity: function(){
		console.log('!');
	}
});
