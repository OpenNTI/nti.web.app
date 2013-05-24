Ext.define('NextThought.model.PresenceInfo',{
	extend: 'NextThought.model.Base',
	idProperty: 'username',
	fields: [
		{ name: 'username', type: 'string'},
		{ name: 'type', type: 'string'},
		{ name: 'show', type: 'string', defaultValue: 'chat'},
		{ name: 'status', type: 'string', defaultValue: null}
	],

	statics: {
		createFromPresenceString: function(presence,username){
			return Ext.create("NextThought.model.PresenceInfo",{
				'username': username,
				'type': (presence.toLowerCase() !== 'online')? 'unavailable' : 'available'
			});
		},

		createPresenceInfo: function(username,type,show,status){
			return Ext.create("NextThought.model.PresenceInfo",{
				'username': username,
				'type': type,
				'show': show,
				'status': status
			});
		}
	},

	isPresenceInfo: true,

	isOnline: function(){
		return this.get('type') !== 'unavailable';
	},

	toString: function(){
		return (this.isOnline()) ? 'Online' : 'Offline';
	}

});