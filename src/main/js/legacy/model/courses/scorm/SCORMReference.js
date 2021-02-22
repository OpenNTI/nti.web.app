const Ext = require('@nti/extjs');

require('../../Base');

module.exports = exports = Ext.define(
	'NextThought.model.courses.scorm.SCORMReference',
	{
		extend: 'NextThought.model.Base',
		mimeType: 'application/vnd.nextthought.scormcontentref',

		statics: {
			mimeType: 'application/vnd.nextthought.scormcontentref',
		},

		fields: [
			{ name: 'scorm_id', type: 'string' },
			{ name: 'title', type: 'string' },
			{ name: 'description', type: 'string' },
			{ name: 'icon', type: 'string' },
			{ name: 'target', type: 'string' },
		],
	}
);
