Ext.define('NextThought.view.account.contacts.ViewContainer',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.contacts-tab-view-container',
	requires: [
		'NextThought.view.account.contacts.View',
		'NextThought.view.chat.Dock'
	],

	title: 'Chat',
	tabConfig: {
		tooltip: 'Chat'
	},

	iconCls: 'contacts',
	ui: 'contacts',

	layout: 'border',
	items: [
		{ xtype: 'contacts-view', region: 'center' },
		{ xtype: 'chat-dock', region: 'south'}
	],

	initComponent: function(){
		this.callParent(arguments);

		this.on('update-chat-badge', function(total){
			this.setNotificationCountValue(total);
		}, this);
	},
	
	addBadge: function(){
		var tab = this.tab;

		if(!tab.rendered){
			if(!tab.isListening('afterrender',this.addBadge,this)){
				tab.on('afterrender',this.addBadge,this);
			}
			return;
		}
		this.badge = Ext.DomHelper.append( tab.getEl(),{cls:'badge', html:tab.badge},true);
		delete tab.badge;
	},


    setNotificationCountValue: function(count){
	    var v = count || '&nbsp;',
			tab = this.tab;

	    if(!this.badge){
		    tab.badge = v;
		    this.addBadge();
		    return;
	    }

        this.badge.update(v);
    }

});
