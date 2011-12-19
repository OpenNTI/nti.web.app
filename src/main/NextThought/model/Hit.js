Ext.define('NextThought.model.Hit', {
    extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Snippet', type: 'string' },
		{ name: 'TargetOID', type: 'string' },
		{ name: 'Title', type: 'string' },
		{ name: 'Type', type: 'string' }
	]
});
