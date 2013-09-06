Ext.define('NextThought.view.profiles.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.profile-panel',

	requires: [
		'NextThought.view.profiles.outline.View',
		'NextThought.view.profiles.parts.Blog'
	],

	navigation: {xtype: 'profile-outline'},

	body:{
		layout: {
			type: 'card',
			deferredRender: true
		}
	},

	ui:  'profile',
	cls: 'profile-view',

	config: {
	},

	constructor: function (config) {
		var u = config.user;
		if(!u){
			Ext.Error.raise('No user provided');
		}

		this.applyConfigs('navigation', {user:u});
		this.applyConfigs('body', {
			items:[
				{ xtype: 'profile-activity', user: u, username: u.getId(), autoScroll:true },
				{ html: 'profile info', user: u },
				{ xtype: 'profile-blog', user:u, username: u.getId(), autoScroll: true }
			]
		});

		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.fireEvent('loaded');
	}

});
