Ext.define('NextThought.model.Page', {
    extend: 'NextThought.model.Base',
	idProperty: 'ID',
	fields: [
		{ name: 'ID', type: 'string' },
		{ name: 'href', type: 'string' },
		{ name: 'Links', type: 'links', defaultValue: [] }
	]
});
