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
				'type': (type)? type : 'unavailable',
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
	},

	getDisplayText: function(){
		if(!this.isOnline()){
			return '';
		}else if(this.get('status') !== null && this.get('status') !== 'null' && this.get('status') !== ''){
			return this.get('status');
		}else{
			if(this.get('show') === 'chat'){
				return 'available';
			}else if(this.get('show') === 'dnd'){
				return 'Do not disturb';
			}
			return this.get('show');
		}
	}

});