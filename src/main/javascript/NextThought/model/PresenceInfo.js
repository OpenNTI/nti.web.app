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

	nameToDisplay: {
		'dnd': 'Do not disturb',
		'available': 'Available',
		'unavailable': '',
		'invisible': 'Invisible'
	},

	isOnline: function(){
		return this.get('type') !== 'unavailable';
	},

	toString: function(){
		return (this.isOnline()) ? 'Online' : 'Offline';
	},

	getDisplayText: function(){
		var status = this.get('status');

		if(!this.isOnline()){
			return '';
		}

		if(!Ext.isEmpty(status) && status !== 'null'){
			return this.get('status');
		}

		return this.nameToDisplay[this.getName()];
	},

	getName: function(){
		var show = this.get('show');
		
		if(!this.isOnline()){
			return 'unavailable';
		}

		if(show === 'chat'){
			return 'available';
		}

		if(show === 'xa'){
			return 'invisible';
		}

		return show
	}

});