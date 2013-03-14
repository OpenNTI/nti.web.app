Ext.define( 'NextThought.view.views.Contacts', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.contacts-view-container',
	requires: [
		'NextThought.view.contacts.Grouping',
		'NextThought.view.contacts.TabPanel'
	],

	cls: 'contacts-view',
	layout: 'auto',
	title: 'NextThought: Contacts',
	
	items: [{
		xtype: 'contacts-tabs',
		width: 725,
		items: [
			{title: 'Contacts', source: 'contacts' },
			{title: 'Distribution Lists', source: 'lists', defaultType: 'contacts-tabs-grouping' },
			{title: 'Groups', source: 'groups', defaultType: 'contacts-tabs-grouping' }
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
