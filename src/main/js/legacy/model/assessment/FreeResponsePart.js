const Ext = require('@nti/extjs');

require('./Part');

module.exports = exports = Ext.define(
	'NextThought.model.assessment.FreeResponsePart',
	{
		extend: 'NextThought.model.assessment.Part',
		mimeType: [
			'application/vnd.nextthought.assessment.freeresponsepart',
			'application/vnd.nextthought.assessment.nongradablefreeresponsepart',
		],
		fields: [],
	}
);
