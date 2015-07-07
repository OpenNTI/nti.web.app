Ext.define('NextThought.model.Video', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.ntivideo',

	fields: [
		{name: 'description', type: 'string'},
		{name: 'subtitle', type: 'string'},
		{name: 'title', type: 'string'},
		{name: 'sources', type: 'auto'},
		{name: 'transcripts', type: 'auto'}
	]
});
