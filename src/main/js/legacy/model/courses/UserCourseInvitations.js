const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.UserCourseInvitations', {
	extend: 'NextThought.model.Base',

	mimeType: 'application/vnd.nextthought.courses.usercourseinvitations',

	fields: [
		{ name: 'Items', type: 'auto' },
		{ name: 'InvalidEmails', type: 'auto'}
	]
});
