/*eslint no-undef:1*/
const Ext = require('@nti/extjs');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('../Base');
require('internal/legacy/mixins/ModelWithBodyContent');

module.exports = exports = Ext.define(
	'NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback',
	{
		extend: 'NextThought.model.Base',

		mimeType:
			'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback',

		isFeedBack: true,

		fields: [
			{ name: 'AssignmentId', type: 'string' },
			{ name: 'body', type: 'auto' },
			{
				name: 'GroupingField',
				mapping: 'Last Modified',
				type: 'groupByTime',
				persist: false,
				affectedBy: 'Last Modified',
			},
			{
				name: 'NotificationGroupingField',
				mapping: 'CreatedTime',
				type: 'groupByTime',
				persist: false,
				affectedBy: 'CreatedTime',
			},
			{ name: 'assignmentName', type: 'string', persist: false },
			{ name: 'assignmentContainer', type: 'string', persist: false },
			{ name: 'assignmentDueDate', type: 'date', persist: false },
			{ name: 'SubmissionCreator', type: 'string' },
		],

		mixins: {
			bodyContent: 'NextThought.mixins.ModelWithBodyContent',
		},

		getFeedbackContainerURL: function () {
			var href = this.get('href');
			return href && href.split('/').slice(0, -1).join('/');
		},

		getSubmissionURL: function () {
			var href = this.get('href');
			return href && href.split('/').slice(0, -2).join('/');
		},

		getFeedbackContainer: function () {
			var url = this.getFeedbackContainerURL();

			if (this.containerPromise) {
				return this.containerPromise;
			}

			this.containerPromise = Service.request(url).then(function (resp) {
				return lazy.ParseUtils.parseItems(resp)[0];
			});

			return this.containerPromise;
		},

		getSubmission: function () {
			var me = this,
				url = me.getSubmissionURL();

			if (me.submissionPromise) {
				return me.submissionPromise;
			}

			me.submissionPromise = Service.request(url).then(function (resp) {
				var submission = lazy.ParseUtils.parseItems(resp)[0];

				if (!me.containerPromise) {
					me.containerPromise = Promise.resolve(
						submission.get('Feedback')
					);
				}

				return submission;
			});

			return me.submissionPromise;
		},
	}
);
