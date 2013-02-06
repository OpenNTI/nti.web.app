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

	getAllRoomStates: function(){
		return this.roomStates || [];
	},

	getRoomState: function(user){
		if(!this.roomStates || this.roomStates.length === 0){ return null;}
		var s;
		Ext.each( this.roomStates, function(r){
			 if(r.user === user){
				s = r.state;
				return false;
			 }
		 });
		return s;
	},

	setRoomState: function(user, state){
		if(!this.roomStates) { this.roomStates =[];}
		var handled = false;
		//Avoid changing to the same state.
		if(this.getRoomState(user) === state){ return; }

		Ext.each(this.roomStates, function(s){
			if(s.user === user){
				s.state = state;
				handled = true;
				return false;
			}
		});
		if(!handled){ this.roomStates.push({ user: user, state: state }); }
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
