Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback', {
	extend: 'NextThought.model.Base',

	isFeedBack: true,

	fields: [
		{ name: 'AssignmentId', type: 'string' },
		{ name: 'body', type: 'auto' },
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified' },
		{ name: 'assignmentName', type: 'string', persist: false },
		{ name: 'assignmentContainer', type: 'string', persist: false }
	],


	getFeedbackContainerURL: function() {
		var href = this.get('href');
		return href && href.split('/').slice(0, -1).join('/');
	},

	getSubmissionURL: function() {
		var href = this.get('href');
		return href && href.split('/').slice(0, -2).join('/');
	},

	getFeedbackContainer: function() {
		var url = this.getFeedbackContainerURL();

		if (this.containerPromise) {
			return this.containerPromise;
		}

		this.containerPromise = Service.request(url)
			.then(function(resp) {
				return ParseUtils.parseItems(resp)[0];
			});

		return this.containerPromise;
	},


	getSubmission: function() {
		var me = this,
			url = me.getSubmissionURL();

		if (me.submissionPromise) {
			return me.submissionPromise;
		}

		me.submissionPromise = Service.request(url)
			.then(function(resp) {
				var submission = ParseUtils.parseItems(resp)[0];

				if (!me.containerPromise) {
					me.containerPromise = Promise.resolve(submission.get('Feedback'));
				}

				return submission;
			});

		return me.submissionPromise;
	},


	getCourse: function() {
		var catalogEntry = CourseWareUtils.courseForNtiid(this.get('AssignmentId'));

		return CourseWareUtils.findCourseBy(catalogEntry.findByMyCourseInstance());
	}
});
