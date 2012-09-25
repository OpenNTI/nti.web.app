Ext.define(	'NextThought.model.User', {
	extend: 'NextThought.model.Base',
	idProperty: 'Username',
	resolveUsers: true,
	fields: [
		{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'NotificationCount', type: 'int' },
		{ name: 'Username', type: 'string' },
		{ name: 'Presence', type: 'string' },
		{ name: 'affiliation', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'email', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'AvatarURLChoices', type: 'AvatarURLList' },
		{ name: 'accepting', type: 'UserList' },
		{ name: 'ignoring', type: 'UserList' },
		{ name: 'status', type: 'string' },
		{ name: 'following', type: 'UserList' },
		{ name: 'Communities', type: 'UserList' },
		{ name: 'displayName', convert: function(v,r){return r.getName();}}
	],

	constructor: function() {
		var r = this.callParent(arguments);
		UserRepository.updateUser(this);
		return r;
	},


	getCommunities: function(){
		var r = [], u;

		Ext.each($AppConfig.userObject.get('Communities'),function(c){
			var field = 'Username';

			if(/^everyone$/i.test(c)){ return; }

			//DFLs come back in communities but there usernames are ntiids.
			if(ParseUtils.parseNtiid(c)){
				field = 'NTIID';
			}

			u = UserRepository.store.findRecord(field,c,0,false,true,true);
			if(u){
				r.push(u);
			}
			else{
				console.warn('Dropping unresolvable community: '+Ext.encode(c));
			}

		});
		return r;
	},


	getName: function(){
		return this.get('alias') || this.get('realname') || this.get('Username');
	},


	statics: {

		getUnresolved: function(username){
			return new NextThought.model.User({
				Username: username,
				avatarURL: 'resources/images/unresolved-user.png',
				affiliation: 'Unknown',
				status: 'Unresolved',
				Presence: 'Offline'
			},username);
		}

	}

},function(){
	window.User = this;
});
