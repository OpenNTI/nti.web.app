Ext.define('NextThought.model.Hit', {
	extend: 'NextThought.model.Base',
	idProperty: null,
	fields: [
		{ name: 'Snippet', type: 'string' },
		{ name: 'TargetOID', type: 'string' },
		{ name: 'Title', type: 'string' },
		{ name: 'Type', type: 'string' },
		{ name: 'Fragments', type: 'auto'},
		//This really needs to move up onto a SearchResult object but we don't have that.  The proxy roots at Items
		{ name: 'PhraseSearch', type: 'auto'}
	]
});
