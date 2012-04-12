Ext.define(	'NextThought.model.UserSearch', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.UserSearch'
	],
	idProperty: 'Username',
	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' }
	],



	getName: function(){
		return this.get('alias') || this.get('realname');
	}
});
