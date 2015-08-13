Ext.define('NextThought.app.assessment.Poll', {
	extend: 'NextThought.app.assessment.Question',
	alias: 'widget.assessment-poll',

	requires: ['NextThought.model.assessment.UsersCourseInquiryItem'],

	NotSubmittedTextOverride: 'Submit',
	SubmittedTextOverride: 'Submit',


	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			historyLink = me.poll.getLink('History');

		if (historyLink) {
			Service.request(historyLink)
				.then(function(response) {
					return ParseUtils.parseItems(response)[0];
				})
				.then(function(history) {
					var submission = history && history.get('Submission');

					if (submission) {
						me.updateWithResults(submission);
					}
				});
		}
	},


	updateWithResults: function() {
		this.callParent(arguments);

		var parts = this.down('question-parts'),
			header = this.down('question-header');

		parts.showQuestionSetWithAnswers();
		header.setTitle('Thank You!');
	},


	checkIt: function() {
		if (this.submissionDisabled) {
			return;
		}

		this.submitted = true;

		var me = this,
			col = {};

		me.gatherQuestionResponse(null, col);

		me.mask('Submitting');

		me.AssessmentActions.submitPoll(me.poll, col[me.poll.getId()], me.startTimeStamp, me.canSubmitIndividually())
			.then(function(result) {
				me.updateWithResults(result);
			})
			.fail(function() {
				alert('Failed to submit your poll');
			})
			.always(function() {
				me.unmask();
			});
	}
});
