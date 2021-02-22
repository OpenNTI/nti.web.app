const Ext = require('@nti/extjs');

require('./BaseEvent');

module.exports = exports = Ext.define(
	'NextThought.model.WebinarCalendarEvent',
	{
		extend: 'NextThought.model.BaseEvent',
		mimeType: 'application/vnd.nextthought.webinar.webinarcalendarevent',

		statics: {
			mimeType:
				'application/vnd.nextthought.webinar.webinarcalendarevent',
		},

		fields: [],
	}
);
