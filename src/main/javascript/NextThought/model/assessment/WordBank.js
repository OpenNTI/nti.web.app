Ext.define('NextThought.model.assessment.WordBank', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.naqwordbank',
	fields: [
		{ name: 'entries', type: 'arrayItem' },
		{ name: 'unique', type: 'bool' }
	]
});

Ext.define('NextThought.model.assessment.wordbank.WordEntry', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.naqwordentry',
	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'WordEntry', persist: false },
		{ name: 'MimeType', type: 'string', defaultValue: 'application/vnd.nextthought.naqwordentry'},
		{ name: 'lang', type: 'string' },
		{ name: 'wid', type: 'string' },
		{ name: 'word', type: 'string' }
	]
});
