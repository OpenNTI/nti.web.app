var Ext = require('extjs');
var ModelBase = require('../../Base');


module.exports = exports = Ext.define('NextThought.model.assessment.wordbank.WordEntry', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.naqwordentry',
	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'WordEntry', persist: false },
		{ name: 'MimeType', type: 'string', defaultValue: 'application/vnd.nextthought.naqwordentry'},
		{ name: 'content', type: 'string' },
		{ name: 'lang', type: 'string' },
		{ name: 'wid', type: 'string' },
		{ name: 'word', type: 'string' }
	]
});