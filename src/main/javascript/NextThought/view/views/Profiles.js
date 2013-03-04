Ext.define( 'NextThought.view.views.Profiles', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.profile-view-container',
	requires: [
		'NextThought.view.profiles.Panel',
		'NextThought.view.ResourceNotFound',
		'Ext.ux.layout.Center'
	],


	defaultType: 'profile-panel',
	layout: 'ux.center',

	initComponent: function(){
		this.callParent(arguments);
		this.mon(this, 'deactivate', this.onDeactivated, this);
	},

	restore: function(state){
		state = ((state||{}).profile||{});
		var user = state.username,
			me = this;

		console.debug('Setting user in profile:',user);
		me.setUser(state,function(panel){
			console.debug('fire finish');
			me.setTitle('Profile: '+user);
			me.fireEvent('finished-restore');
		});
	},


	getHash: function(){
		var current = this.down('profile-panel');
		return current? current.userObject.getProfileUrl() : null;
	},


	setUser: function(state, finishCallback){
		var current = this.down('profile-panel'),
			username = state.username,
			me = this;

		function fin(){
			me.unmask();
			Ext.callback(finishCallback,this,[current]);
		}

		if(current && current.username === username){
			current.setActiveTab(state.activeTab);
			fin();
			return;
		}

		this.mask('Loading...');

		UserRepository.getUser(username, function(user){
			var toAdd, shouldFireLoaded;
			this.removeAll(true);
			try{
				if(user.isUnresolved()){
					console.error('Can\'t show profile for unresolved user', user);
					//TODO push generic unknown object handler here
					toAdd = {xtype: 'notfound'};
					shouldFireLoaded = true;
				}
				else{
					//TODO pass in the reolved user here so we don't have to pass back through the UserRepository again
					toAdd = {username: username, activeTab: state.activeTab};
				}
				toAdd = Ext.apply(toAdd, {
					listeners: { loaded:fin, scope:this, single: true, delay:1 },
					minWidth: 700,
					widthRatio: 0.8
				});
				current = this.add(toAdd);
				if(shouldFireLoaded){
					fin();
				}
			}
			catch(exception){
				console.error(Globals.getError(exception));
				Ext.callback(finishCallback,this);
			}

		}, this, true);
	},

	onDeactivated: function(){
		var profile = this.down('profile-panel');
		//save memory/dom by cleaning out the profile object while its not active.
		if(profile){
			//console.debug('Destroying profile widget');
			profile.destroy();
		}
	}
});
