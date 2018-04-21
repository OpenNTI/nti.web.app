const Ext = require('@nti/extjs');

require('../Base');
require('./PollSubmission');


module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseInquiryItem', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Submission', type: 'singleItem'}
	]
});
