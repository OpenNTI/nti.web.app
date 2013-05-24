Ext.define('NextThought.model.PresenceInfo',{
	extend: 'NextThought.model.Base',
	idProperty: 'username',
	fields: [
		{ name: 'username', type: 'string'},
		{ name: 'type', type: 'string'},
		{ name: 'show', type: 'string'},
		{ name: 'status', type: 'string'}
	],

	statics: {
		createFromPresenceString: function(presence,username){
			return Ext.create("NextThought.model.PresenceInfo",{
				'username': username,
				'type': (presence.toLowerCase() !== 'online')? 'unavailable' : 'available'
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

	toSocketObject: function(){
		var obj = {
			'Class': 'PresenceInfo',
			'MimeType': 'application/vnd.nextthought.presenceinfo',
			'username': this.get('username'),
			'type': this.get('type')
		};

		if(this.get('show')){
			obj['show'] = this.get('show');
		}

		if(this.get('status')){
			obj['status'] = this.get('status');
		}

		return obj;
	}


});