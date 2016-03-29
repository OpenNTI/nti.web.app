var Ext = require('extjs');
var ModelBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.GenericObject', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'text', type: 'string' },
		{ name: 'sharedWith', type: 'UserList' }
	]
});
