const Ext = require('@nti/extjs');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('internal/legacy/model/assessment/UsersCourseInquiryItem');
require('internal/legacy/model/assessment/UsersCourseInquiryItemResponse');
require('./results/Poll');
require('./Question');

module.exports = exports = Ext.define('NextThought.app.assessment.Poll', {
	extend: 'NextThought.app.assessment.Question',
	alias: 'widget.assessment-poll',
	cls: 'question scrollable poll',
	NotSubmittedTextOverride: 'Submit',
	SubmittedTextOverride: false,

	initComponent: function () {
		this.callParent(arguments);

		var me = this,
			historyLink = me.poll.getLink('History');

		if (historyLink) {
			this.hasSubmission = true;
			Service.request(historyLink)
				.then(function (response) {
					return lazy.ParseUtils.parseItems(response)[0];
				})
				.then(function (history) {
					var submission = history && history.get('Submission');

					if (submission) {
						me.updateWithResults(submission);
					}
				});
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		var surveyClosed = this.survey && this.survey.get('isClosed'),
			pollClosed = this.poll.get('isClosed'),
			header = this.down('question-header');

		if (!this.hasSubmission && (surveyClosed || pollClosed)) {
			this.addCls('no-data');
			header.setTitle('Closed');
		}

		if (this.survey) {
			this.mon(this.survey, {
				'show-results': this.showResults.bind(this),
				'hide-results': this.hideResults.bind(this),
			});
		}
	},

	updateWithResults: function () {
		this.callParent(arguments);

		var parts = this.down('question-parts'),
			header = this.down('question-header');

		this.removeCls('no-data');

		parts.showQuestionSetWithAnswers();

		if (!this.questionSet || !this.questionSet.isSurvey) {
			header.setTitle('Thank You!');
		}
	},

	checkIt: function () {
		if (this.submissionDisabled) {
			return;
		}

		this.submitted = true;

		var me = this,
			col = {};

		me.gatherQuestionResponse(null, col);

		me.mask('Submitting');

		const location = this.reader.getLocation();
		const bundle = location.currentBundle;

		me.AssessmentActions.submitPoll(
			me.poll,
			col[me.poll.getId()],
			me.startTimeStamp,
			me.canSubmitIndividually(),
			bundle
		)
			.then(function (result) {
				me.poll.setResults(result.get('Aggregated'));
				me.updateWithResults(
					result.get('Submission').get('Submission')
				);
			})
			.catch(function () {
				alert('Failed to submit your poll');
			})
			.always(function () {
				me.unmask();
			});
	},

	getResults: function () {
		return this.survey
			? this.survey.getResults(this.poll.getId())
			: this.poll.getResults();
	},

	showResults: function () {
		var parts = this.down('question-parts'),
			header = this.down('question-header');

		header.hide();
		parts.hide();

		this.addCls('showing-results');
		this.removeCls('no-data');

		this.add(
			Ext.widget('assessment-result', {
				poll: this.poll,
				survey: this.survey,
				getResults: this.getResults.bind(this),
				syncHeight: this.syncElementHeight.bind(this),
				syncPositioning: this.self.syncPositioningTillStable.bind(
					this.self
				),
				doHideResults: this.hideResults.bind(this),
			})
		);
	},

	hideResults: function () {
		var parts = this.down('question-parts'),
			results = this.down('assessment-result'),
			header = this.down('question-header'),
			surveyClosed = this.survey && this.survey.get('isClosed'),
			pollClosed = this.poll.get('isClosed');

		this.removeCls('showing-results');

		if (!this.hasSubmission && (surveyClosed || pollClosed)) {
			this.addCls('no-data');
		}

		parts.show();
		header.maybeShow();

		this.remove(results, true);
	},
});
