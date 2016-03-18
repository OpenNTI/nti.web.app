var Ext = require('extjs');
var ModelBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.Discussion', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'icon', type: 'string'},
		{name: 'label', type: 'string'},
		{name: 'title', type: 'string'}
	]
});
