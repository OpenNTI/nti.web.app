const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define(
	'NextThought.model.preference.chatpresence.Available',
	{
		extend: 'NextThought.model.preference.chatpresence.Base',

		getResourceUrl: function () {
			var base = this.callParent(arguments);

			return base + '/Available';
		},
	}
);
