Ext.define('NextThought.model.PresenceInfo',{
	extend: 'NextThought.model.Base',
	idProperty: 'Username',
	fields: [
		{ name: 'Username', type: 'string'},
		{ name: 'type', type: 'string'},
		{ name: 'show', type: 'string'},
		{ name: 'status', type: 'string'}
	],

	statics: {
		createFromPresenceString: function(presence,username){
			return Ext.create("NextThought.model.PresenceInfo",{
				'Username': username,
				'type': (presence === 'online')? 'available' : 'unavailable'
			});
		}
	},

	isPresenceInfo: true,

	isOnline: function(){
		return this.get('type') !== 'unavailable';
	},

	toString: function(){
		return (this.isOnline()) ? 'online' : 'offline';
	}


});