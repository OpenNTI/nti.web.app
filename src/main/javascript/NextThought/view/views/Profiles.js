Ext.define( 'NextThought.view.views.Profiles', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.profile-view-container',
	requires: [
		'NextThought.view.profiles.Panel',
		'NextThought.view.ResourceNotFound'
	],


	defaultType: 'profile-panel',
	layout: 'auto',


	restore: function(state){
		var user = ((state||{}).profile||{}).username,
			me = this;

		console.debug('Setting user in profile:',user);
		me.setUser(user,function(panel){
			console.debug('fire finish');
			me.setTitle('Profile: '+user);
			me.fireEvent('finished-restore');
		});
	},


	getHash: function(){
		var current = this.down('profile-panel');
		return current? current.userObject.getProfileUrl() : null;
	},


	setUser: function(username, finishCallback){
		var current = this.down('profile-panel');

		function fin(){
			this.unmask();
			Ext.callback(finishCallback,this,[current]);
		}

		if(current && current.username === username){
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
					toAdd = {username: username};
				}
				toAdd = Ext.apply(toAdd, {listeners: { loaded:fin, scope:this, single: true, delay:1 }});
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
	}
});
