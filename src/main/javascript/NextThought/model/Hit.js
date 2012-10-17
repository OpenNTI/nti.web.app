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
	],

	//We don't use the idProperty because there isn't a unique id,
	//but for legacy reasons people expect to call getId and get the ntiid
	getId: function(){
		return this.get('NTIID');
	}
});
