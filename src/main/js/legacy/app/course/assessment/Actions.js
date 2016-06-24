var Ext = require('extjs');
var ParseUtils = require('../../../util/Parsing');

const ASSIGNMENT_TPL = {
	'Class': 'Assignment',
	'MimeType': 'application/vnd.nextthought.assessment.assignment',
	'content': '',
	'parts': [],
	'title': 'Untitled Assignment'
};


module.exports = exports = Ext.define('NextThought.app.course.assessment.Actions', {
	extend: 'NextThought.common.Actions',

	createAssignmentIn (bundle) {
		const link = bundle.getLink('CourseEvaluations');

		if (!link) {
			return Promise.reject('No link');
		}

		return Service.post(link, ASSIGNMENT_TPL)
			.then((resp) => {
				return ParseUtils.parseItems(resp)[0];
			})
			.catch((reason) => {
				console.error('Failed to create assignment: ', reason);
				return Promise.reject(reason);
			});
	}
});
