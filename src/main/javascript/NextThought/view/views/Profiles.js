Ext.define( 'NextThought.view.views.Profiles', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.profile-view-container',
	requires: [
		'NextThought.view.profiles.Panel'
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


	setUser: function(username, finishCallback){
		var current = this.down('profile-panel');

		function fin(){
			Ext.callback(finishCallback,this,[current]);
		}

		if(current && current.username === username){
			fin();
			return;
		}

		this.removeAll(true);

		try{
			current = this.add({username: username, listeners: { loaded:fin, scope:this, single: true, delay:1 }});
		}
		catch(exception){
			console.error(Globals.getError(exception));
			Ext.callback(finishCallback,this);
		}
	}
});
