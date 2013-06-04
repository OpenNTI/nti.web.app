Ext.define('NextThought.model.RoomInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'ID',
	fields: [
		{ name: 'Active', type: 'bool' },
		{ name: 'MessageCount', type: 'int' },
		{ name: 'Occupants', type: 'UserList'},
		{ name: 'Moderators', type: 'UserList'},
		{ name: 'Moderated', type: 'bool'},
		{ name: 'lastActive', persist: false, type: 'auto'},
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] }
	],

	isGroupChat: function(){
		var participants = this.getOriginalOccupants();

		if( Ext.isEmpty(participants, false) ){
			participants = this.get('Occupants');
		}
		return participants.length > 2;
	},

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
	},

	/*
	 *  NOTE: We want to add an additional property 'OriginalOccupants' that we will use to compare 1-1 rooms with the same occupants(to see if we can merge them.)
	 *  Because Occupants property only contain the live list of occupants and
	 *  some occupants might have left the chat before, the original occupants will help to compare chat rooms with the same occupants.
	 */

	setOriginalOccupants: function(occupants){
		this._originalOccupants = occupants;
	},

	getOriginalOccupants: function(){
		return this._originalOccupants || [];
	}
});
