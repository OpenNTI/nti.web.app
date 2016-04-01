const Ext = require('extjs');
require('./Base');

module.exports = exports = Ext.define('NextThought.model.ContentFile', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'FileMimeType', type: 'string'},
		{name: 'url', type: 'string'},
		{name: 'downloadURL', type: 'string', mapping: 'download_url'},
		{name: 'name', type: 'string'},
		{name: 'size', type: 'number'},
		{name: 'filename', type: 'string'},
		{name: 'contentType', type: 'string'}
	]
});
