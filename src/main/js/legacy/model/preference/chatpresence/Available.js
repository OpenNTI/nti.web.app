var Ext = require('extjs');
var ChatpresenceBase = require('./Base');


module.exports = exports = Ext.define('NextThought.model.preference.chatpresence.Available', {
	extend: 'NextThought.model.preference.chatpresence.Base',

	getResourceUrl: function() {
		var base = this.callParent(arguments);

		return base + '/Available';
	}
});
