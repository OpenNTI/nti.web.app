/**
 * See UserRepository#prefetchUser() on how these are resolved.
 *
 * DO NOT let these be queried for by the user search/ UserRepository resolver methods. (Bad things will happen)
 */
Ext.define('NextThought.model.Community', {
	extend: 'NextThought.model.Base',
	idProperty: 'Username',
	fields: [
		{ name: 'Username', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'string' }
	],
	
	constructor: function() {
		this.callParent(arguments);
		UserRepository.updateUser(this);
	}
});
