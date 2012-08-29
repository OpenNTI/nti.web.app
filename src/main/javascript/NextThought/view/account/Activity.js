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
			activitiesHolder: 1,
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
		var container = this.down('container[activitiesHolder]'),
			items = [];

		function doGroup(group){
			var label = (group.name||'').replace(/^[A-Z]\d{0,}\s/,'') || false;
			if(label){
				items.push({ xtype: 'box', html:label, cls: 'divider' });
			}

			Ext.each(group.children,function(c){items.push({change:c});});
		}

		Ext.each(store.getGroups(),doGroup,this);

		try{
			container.removeAll(true);
			container.add(items);
		}catch(er){
			console.error(container, 'is not what we expected');
		}
	},

	newActivity: function(){
		console.log('!');
	}
});
