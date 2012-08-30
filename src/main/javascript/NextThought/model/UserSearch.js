Ext.define(	'NextThought.model.UserSearch', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.UserSearch'
	],
	idProperty: 'Username',
	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'affiliation', type: 'string', persist:false },
		{ name: 'alias', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'status', type: 'string' },
		{ name: 'displayName', convert: function(v,r){return r.getName();}}
	],



	getName: function(){
		return this.get('alias') || this.get('realname') || this.get('Username');
	}
});
