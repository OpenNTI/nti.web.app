const Ext = require('extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.preference.Gradebook', {
	extend: 'NextThought.model.preference.Base',

	fields: [
		{name: 'hide_avatars', type: 'bool'}
	],

	getResourceUrl: function () {
		var base = this.callParent(arguments);

		return base + '/Gradebook';
	}
});
