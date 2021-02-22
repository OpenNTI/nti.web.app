const Ext = require('@nti/extjs');

require('./HeadlineTopic');
require('./DFLHeadlinePost');

module.exports = exports = Ext.define(
	'NextThought.model.forums.DFLHeadlineTopic',
	{
		extend: 'NextThought.model.forums.HeadlineTopic',
	}
);
