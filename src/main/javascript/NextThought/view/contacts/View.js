Ext.define( 'NextThought.view.contacts.View', {
	extend: 'NextThought.view.View',
	alias:	'widget.contacts-view-container',
	requires: [
		'NextThought.view.BoundPanel',
		'NextThought.view.contacts.Grouping',
		'NextThought.view.contacts.TabPanel',
		'NextThought.view.contacts.GroupButtons',
        'NextThought.view.contacts.ListButtons'
	],

	cls: 'contacts-view',
	layout: 'auto',
	title: 'NextThought: Contacts',
	
	items: [{
		xtype: 'contacts-tabs',
		width: 725,
		items: [
			{xtype:'data-bound-panel', title: 'Contacts', defaultType: 'contacts-tabs-card', storeId: 'online-contacts-store' },
			{xtype:'data-bound-panel', title: 'Distribution Lists', defaultType: 'contacts-tabs-grouping', storeId: 'FriendsList',
				filter: function(group){return !group.isDFL;},
				defaultInsertPoint: 1,
				items:[{xtype: 'list-buttons'}]},
			{xtype:'data-bound-panel', title: 'Groups', defaultType: 'contacts-tabs-grouping', storeId: 'FriendsList',
				filter: function(group){return group.isDFL;},
				defaultInsertPoint: 1,
				items:[ {xtype: 'group-buttons'} ] }
		]
	}],



	initComponent: function(){
		var me = this;

		me.callParent(arguments);
		me.tabs = me.down('contacts-tabs');
		me.mon(me.tabs,'tabchange',me.monitorTabs,me);
		me.on('resize',function(){
			me.tabs.setHeight(me.getHeight());
		});
	},

	monitorTabs: function(panel,newTab,oldTab){
		if(this.restoring){return;}
		var state = {};
		state[this.getId()] = {source:newTab.source};
		history.pushState(state,this.title,location.toString());
	},

	restore: function(state){
		this.fireEvent('finished-restore');

		var myState = state[this.getId()], tab;
		if(myState && myState.source){
			tab = this.down('[source="'+myState.source+'"]');
			this.restoring = true;
			this.tabs.setActiveTab(tab);
			delete this.restoring;
			this.updateLayout();
		}
	}
});
