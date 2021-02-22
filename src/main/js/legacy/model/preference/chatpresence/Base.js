const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define(
	'NextThought.model.preference.chatpresence.Base',
	{
		extend: 'NextThought.model.preference.Base',

		fields: [
			{ name: 'show', type: 'String' },
			{ name: 'status', type: 'String' },
			{ name: 'type', type: 'String' },
		],

		getResourceUrl: function () {
			var base = this.callParent(arguments);

			return base + '/ChatPresence';
		},
	}
);
