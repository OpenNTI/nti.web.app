const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.BaseEvent', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'title', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'location', type: 'string' },
		{ name: 'icon', type: 'string' },
		{ name: 'start_time', type: 'date' },
		{ name: 'end_time', type: 'date' },
	],
});
