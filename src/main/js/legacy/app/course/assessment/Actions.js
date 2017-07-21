const Ext = require('extjs');

const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));

require('legacy/model/assessment/Assignment');
require('legacy/model/assessment/DiscussionAssignment');

const ASSIGNMENT_TPL = {
	'Class': 'Assignment',
	'MimeType': 'application/vnd.nextthought.assessment.assignment',
	'content': '',
	'parts': [],
	'title': 'Untitled Assignment'
};

const DISCUSSION_TPL = {
	'Class': 'DiscussionAssignment',
	'MimeType': 'application/vnd.nextthought.assessment.discussionassignment',
	'content': '',
	'title': 'Untitled Assignment'
};

function createAssignmentWithData (link, data) {
	if (!link) {
		return Promise.reject('No Link');
	}

	return Service.post(link, data)
		.then((resp) => {
			return lazy.ParseUtils.parseItems(resp)[0];
		})
		.catch((reason) => {
			console.error('Failed to create assignment: ', reason);
			return Promise.reject(reason);
		});
}


module.exports = exports = Ext.define('NextThought.app.course.assessment.Actions', {
	extend: 'NextThought.common.Actions',

	createAssignmentIn (bundle) {
		const link = bundle.getLink('CourseEvaluations');

		return createAssignmentWithData(link, ASSIGNMENT_TPL);
	},


	createDiscussionAssignmentIn (bundle) {
		const link = bundle.getLink('CourseEvaluations');

		return createAssignmentWithData(link, DISCUSSION_TPL);
	}
});
