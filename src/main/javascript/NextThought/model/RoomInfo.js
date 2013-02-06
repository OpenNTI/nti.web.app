Ext.define('NextThought.model.RoomInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'ID',
	fields: [
		{ name: 'Active', type: 'bool' },
		{ name: 'MessageCount', type: 'int' },
		{ name: 'Occupants', type: 'UserList'},
		{ name: 'Moderators', type: 'UserList'},
		{ name: 'Moderated', type: 'bool'},
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] }
	],

	getAllRoomStates: function(){ return this.roomStates || {}; },

	getRoomState: function(user){
		if(!this.roomStates){ return null;}
		return this.roomStates[user];
	},

	setRoomState: function(user, state){
		if(!this.roomStates) { this.roomStates = {};}
		this.roomStates[user] = state;
	},

	getInputTypeStates: function(){
		var p =[], inputStates = ['composing', 'paused'], me = this;
		Ext.each(me.get('Occupants'), function(user){
			var userState = me.getRoomState(user);
			if(Ext.Array.contains(inputStates, userState) && !isMe(user)){
				p.push({user: user, state: userState});
			}
		});
		return p;
	}
});
