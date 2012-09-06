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
			if(!/^everyone$/i.test(c)){
				//FIXME dfls come back in communities but there usernames
				//are ntiids.  We can't seem to find them in the below lookup
				//and we end up with null in the return value.  That creates
				//all sorts of issues later on so as a quick fix don't add them
				u = UserRepository.store.findRecord('Username',c);
				if(u){
					r.push(u);
				}
				else{
					console.warn('dropping unresolvable community', c);
				}
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
