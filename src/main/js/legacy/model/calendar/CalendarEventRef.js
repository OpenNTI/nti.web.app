const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.CalendarEventRef', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.nticalendareventref',

	statics: {
		mimeType: 'application/vnd.nextthought.nticalendareventref',
	},

	fields: [
		{name: 'CalendarEvent', type: 'object'}
	]

});
