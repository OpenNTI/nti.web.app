Ext.define('NextThought.model.ContentBlobFile', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'FileMimeType', type: 'string'},
		{name: 'contentType', type: 'string'},
		{name: 'download_url', type: 'string'},
		{name: 'filename', type: 'string'},
		{name: 'size', type: 'number'},
		{name: 'url', type: 'string'}
	]
});
