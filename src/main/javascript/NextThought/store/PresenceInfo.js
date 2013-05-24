Ext.define('NextThought.store.PresenceInfo', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.PresenceInfo',

	autoLoad: false,

	getPresenceOf: function(user){
		var username = (user && user.isModel) ?  user.get('Username') : user;

		if(!username){ return;}

		return this.getById(username);
	},

	setPresenceOf: function(username,values){
		var user = this.getPresenceOf(username);

		if(user){
			//user's presence is already in here
			user.set(values.get('Data'));
		}else{
			//user's not in here
			this.add(values);
		}

		this.fireEvent('presence-changed',username,values);
	}
});