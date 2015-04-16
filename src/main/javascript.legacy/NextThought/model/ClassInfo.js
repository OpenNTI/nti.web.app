Ext.define('NextThought.model.ClassInfo', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'ContainerId', type: 'string', defaultValue: 'Classes' },
		{ name: 'Description', type: 'string' },
		{ name: 'Sections', type: 'arrayItem' }
	]
});
