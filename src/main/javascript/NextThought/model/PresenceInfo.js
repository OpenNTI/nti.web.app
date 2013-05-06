Ext.define('NextThought.model.PresenceInfo',{
	extend: 'NextThought.model.Base',
	idProperty: 'Username',
	fields: [
		{ name: 'Username', type: 'string'},
		{ name: 'type', type: 'string'},
		{ name: 'show', type: 'string'},
		{ name: 'status', type: 'string'},
	],

	isPresenceInfo: true
});