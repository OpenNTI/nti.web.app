const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('internal/legacy/model/assessment/Assignment');
require('internal/legacy/model/assessment/DiscussionAssignment');

const t = scoped('nti-web-app.course.assessment.Actions', {
	untitled: 'Untitled Assignment',
	untitledSurvey: 'Untitled Survey',
});

const ASSIGNMENT_TPL = {
	Class: 'Assignment',
	MimeType: 'application/vnd.nextthought.assessment.assignment',
	content: '',
	parts: [],
	title: 'Untitled Assignment',
};

const DISCUSSION_TPL = {
	Class: 'DiscussionAssignment',
	MimeType: 'application/vnd.nextthought.assessment.discussionassignment',
	content: '',
	title: 'Untitled Assignment',
};

const SurveyTpl = {
	Class: 'Survey',
	MimeType: 'application/vnd.nextthought.nasurvey',
	contents: '',
	title: 'Untitled Survey',
};

async function createWithData(link, data) {
	if (!link) {
		throw new Error('No Link');
	}

	try {
		const resp = await Service.post(link, data);
		return lazy.ParseUtils.parseItems(resp)[0];
	} catch (reason) {
		console.error('Failed to create assignment: ', reason);
		throw reason;
	}
}

module.exports = exports = Ext.define(
	'NextThought.app.course.assessment.Actions',
	{
		extend: 'NextThought.common.Actions',

		createAssignmentIn(bundle) {
			const link = bundle.getLink('CourseEvaluations');

			return createWithData(link, {
				...ASSIGNMENT_TPL,
				title: t('untitled'),
			});
		},

		createDiscussionAssignmentIn(bundle) {
			const link = bundle.getLink('CourseEvaluations');

			return createWithData(link, {
				...DISCUSSION_TPL,
				title: t('untitled'),
			});
		},

		createSurveyIn(bundle) {
			const link = bundle.getLink('CourseEvaluations');

			return createWithData(link, {
				...SurveyTpl,
				title: t('untitledSurvey'),
			});
		},
	}
);
