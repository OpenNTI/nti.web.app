Ext.define('NextThought.view.profiles.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.profile-panel',

	requires: [
		'NextThought.view.profiles.About',
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
		state: null,
		user: null,
		username: ''
	},

	constructor: function (config) {
		var me = this,
			u = config.user;

		if(!u){
			Ext.Error.raise('No user provided');
		}

		this.applyConfigs('navigation', {user:u});
		this.applyConfigs('body', {
			items:[
				{ xtype: 'profile-activity', user: u, username: u.getId(), autoScroll:true },
				{ xtype: 'profile-about', user: u },
				{ xtype: 'profile-blog', user:u, username: u.getId(), autoScroll: true }
			]
		});

		this.callParent(arguments);

		function monitor(panel){
			me.mon(panel,{
				beforeactivate:'onBeforeViewChanged',
				activate:'onViewChanged'
			});
		}

		this.body.items.each(monitor,this);
		this.mon(this.navigation,{
			'show-profile-view':'changeView'
		});

		this.on('beforedeactivate', 'onBeforeDeactivate');
	},


	afterRender: function(){
		this.callParent(arguments);
		this.initState();
	},


	initState: function(){
		//drive initial state restore here
		this.restoreState(this.getState());
	},


	restoreState: function(state){
		this.setState(state);
		console.log(state);
		this.fireEvent('restored');
	},


	onBeforeDeactivate: function () {
		console.log('about to deactivate the profile view');
		return Ext.Array.every(this.body.items.items, function (item) {
			return item.fireEvent('beforedeactivate');
		});
	},


	changeView: function(view, action, data){
		var c = this.down(view);
		if(c){
			this.body.getLayout().setActiveItem(c);
		}
	},


	onBeforeViewChanged: function(){
		console.debug('onBeforeViewChange');
	},


	onViewChanged: function(activeCmp){
//		console.debug('onViewChange', activeCmp.id);
		this.navigation.updateSelection(activeCmp);
	}

});
