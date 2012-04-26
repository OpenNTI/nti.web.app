Ext.define('NextThought.model.Title', {
	extend: 'NextThought.model.Base',
	idProperty: 'index',
	fields: [
		{ name: 'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'archive', type: 'string' },
		{ name: 'icon', type: 'string' },
		{ name: 'index', type: 'string' },
		{ name: 'installable', type: 'bool' },
		{ name: 'root', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'version', type: 'string'},
		{ name: 'path', type: 'string', defaultValue: ''}
	]
});
