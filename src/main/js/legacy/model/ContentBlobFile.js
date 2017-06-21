const Ext = require('extjs');

const Globals = require('legacy/util/Globals');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.ContentBlobFile', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'FileMimeType', type: 'string'},
		{name: 'contentType', type: 'string'},
		{name: 'download_url', type: 'string'},
		{name: 'filename', type: 'string'},
		{name: 'size', type: 'number'},
		{name: 'url', type: 'string'}
	],


	getSrc () {
		let url = this.get('url');
		let download = this.get('download_url');

		return Globals.shouldOpenInApp(this.get('NTIID'), url, '', this.get('FileMimeType')) ? url : download;
	}
});
