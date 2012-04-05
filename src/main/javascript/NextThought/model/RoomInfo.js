Ext.define('NextThought.model.RoomInfo', {
	extend: 'NextThought.model.Base',
	idProperty: 'ID',
	fields: [
		{ name: 'Active', type: 'bool' },
		{ name: 'MessageCount', type: 'int' },
		{ name: 'Occupants', type: 'UserList'},
		{ name: 'Moderators', type: 'UserList'},
		{ name: 'Moderated', type: 'bool'},
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] }
	]
});
