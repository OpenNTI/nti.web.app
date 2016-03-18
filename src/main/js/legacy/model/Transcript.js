var Ext = require('extjs');
var ModelBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.Transcript', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'RoomInfo', type: 'singleItem' },
		{ name: 'Messages', type: 'arrayItem' },
		{ name: 'Contributors', type: 'auto' }
	],
	proxy: {
		reader: 'nti',
		type: 'rest',
		appendId: false,
		headers: { 'Accept': 'application/vnd.nextthought.transcript+json' },
		url: ''//pupulated by caller
	},

	isTranscript: true
});
