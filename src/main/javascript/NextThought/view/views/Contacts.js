Ext.define( 'NextThought.view.views.Contacts', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.contacts-view-container',
	requires: [
		'NextThought.view.contacts.Grouping',
		'NextThought.view.contacts.TabPanel',
		'Ext.ux.layout.Center'
	],

	cls: 'contacts-view',
	layout: 'ux.center',
	title: 'NextThought: Contacts',
	
	items: [{
		xtype: 'contacts-tabs',
		minWidth: 700,
		maxWidth: 800,
		widthRatio: 0.8,
		items: [
			{title: 'Contacts', source: 'contacts' },
			{title: 'Distribution Lists', source: 'lists', defaultType: 'contacts-tabs-grouping' },
			{title: 'Groups', source: 'groups', defaultType: 'contacts-tabs-grouping' }
		]
	}],



	initComponent: function(){
		this.callParent(arguments);
		this.tabs = this.down('contacts-tabs');
		this.mon(this.tabs,'tabchange',this.monitorTabs,this);
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
