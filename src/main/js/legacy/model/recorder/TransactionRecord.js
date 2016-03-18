var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.recorder.TransactionRecord', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.recorder.transactionrecord',

	fields: [
		{ name: 'Recordable', type: 'auto' },
		{ name: 'principal', type: 'string' },
		{ name: 'tid', type: 'string' },
		{ name: 'type', type: 'create' },
		{ name: 'attributes', type: 'auto'}
	]

});
