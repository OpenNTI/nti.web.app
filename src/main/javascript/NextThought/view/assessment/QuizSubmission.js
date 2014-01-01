Ext.define('NextThought.view.assessment.QuizSubmission', {
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.assessment-quiz-submission',
	requires: [
	],

	cls: 'submission-panel',
	ui: 'assessment',
	appendPlaceholder: true,
	hidden: true,
	shouldShow: true,

	/* Because we're inheriting from a "Panel" to get the special handling provided by the super class, we can't use
	 * our typical renderTpl. Instead we're going to take advantage of the Ext.panal.Panel's html config property...
	 *
	 * We don't normally do this for our custom widgets, because the Panel is a fairly heavy weight component, so don't
	 * use this class as an exmaple of how to make custom components.
	 */
	html: Ext.DomHelper.markup([
		{ cls: 'buttons', cn: [
			{tag: 'a', href: '#', cls: 'reset', html: 'Cancel'},
			{tag: 'a', href: '#', cls: 'submit tabable disabled', html: 'I\'m Finished!'}
		] },
		{ cls: 'status' }
	]),

	renderSelectors: {
		statusMessage: '.status',
		resetBtn: '.reset',
		submitBtn: '.submit'
	},

	initComponent: function() {
		var answeredMap = {};

		this.callParent(arguments);
		this.hide();
		this.mon(this.questionSet, {
			scope: this,
			'answered': 'updateStatus',
			'reset': 'reset',
			'graded': 'graded',
			'hide-quiz-submission': 'disableView',
			'do-submission': 'submitClicked'
		});

		Ext.each(this.questionSet.get('questions'), function(q) {
			var questionMap = {};

			Ext.each(q.get('parts'), function(p) {
				questionMap[p.id] = false;
			});

			answeredMap[q.getId()] = questionMap;
		});

		this.answeredMap = answeredMap;
	},


	afterRender: function() {
		this.callParent(arguments);
		this.resetBtn.hide();
		this.reflectStateChange();
		this.mon(this.resetBtn, 'click', this.resetClicked, this);
		this.mon(this.submitBtn, 'click', this.submitClicked, this);
		var r = this.resetBtn,
			s = this.submitBtn,
			t = this.tabIndexTracker;
		setTimeout(function() {
			s.set({tabIndex: t.getNext()});
			r.set({tabIndex: t.getNext()});
		},1);
		this.fireEvent('has-been-submitted', this);
	},


	isActive: function() {
		return this.state === 'active';
	},


	isSubmitted: function() {
		return this.state === 'submitted';
	},


	isReady: function() {
		return !this.isActive() && !this.isSubmitted;
	},


	disableView: function() {
		this.shouldShow = false;
		this.hide();
	},

	moveToActive: function() {
		if (this.isActive()) {
			return;
		}
		console.log('New status is active');
		this.state = 'active';
		this.resetBtn.show();
		this.statusMessage.show();
		this.submitBtn.update('I\'m Finished');
		this.submitBtn.removeCls('disabled');
		this.show();
	},


	moveToSubmitted: function() {
		if (this.isSubmitted()) {
			return;
		}

		var isAssignment = !!this.questionSet.associatedAssignment;
		if (isAssignment) {
			this.shouldShow = false;
			this.hide();
		}

		console.log('New status is submitted');
		this.state = 'submitted';
		this.submitted = true;
		this.resetBtn.hide();
		this.statusMessage.hide();
		this.submitBtn.update('Try Again');
		this.submitBtn.removeCls('disabled');
	},


	moveToReady: function() {
		if (this.isReady()) {
			return;
		}
		console.log('New status is ready');
		delete this.state;
		delete this.submitted;
	},


	transitionToActive: function() {
		if (this.isSubmitted()) {
			this.maybeDoReset(true);
		}
		this.moveToActive();
	},


	updateStatus: function(question, part, status, enabling) {
		if (enabling) {
			this.transitionToActive();
		}

		this.answeredMap[question.getId()][part.id] = Boolean(status);
		this.reflectStateChange();
	},


	reflectStateChange: function() {
		var unansweredQuestions = 0;
		if (!this.rendered) { return; }

		Ext.Object.each(this.answeredMap, function(key, val) {
			var answered = 0, total = 0;

			Ext.Object.each(val, function(id, done) {
				total++;

				if (done) { answered++; }
			});

			if (answered < total) {
				unansweredQuestions++;
			}
		});

		this.statusMessage.update(unansweredQuestions === 0 ?
								  'All questions answered' :
								  Ext.String.format('{0} questions unanswered', unansweredQuestions)
		);

		this.statusMessage[((unansweredQuestions === 0) ? 'add' : 'remove') + 'Cls']('ready');
	},


	reset: function() {
		this.moveToReady();
	},


	graded: function() {
		this.moveToSubmitted();
	},


	maybeDoReset: function(keepAnswers) {
		var q = this.questionSet;
		if (q.fireEvent('beforereset')) {
			q.fireEvent('reset', keepAnswers);
			console.log('fired reset');
			return true;
		}

		console.log('reset aborted');
		return false;
	},


	resetBasedOnButtonClick: function(e) {
		//If we are in a submitted state we want to reset things
		if (this.maybeDoReset(true)) {
			this.reader.getScroll().to(0);
		}

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	resetClicked: function(e) {
		if (this.isSubmitted()) {
			return this.resetBasedOnButtonClick(e);
		}

		this.maybeDoReset(false);

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	submitClicked: function(e) {
		var q = this.questionSet,
			isAssignment = !!q.associatedAssignment,
			submission = {};

		if (this.shouldShow) {//skip this part if we're being driven by the file-submission UI.
			if (!this.submitBtn || this.submitBtn.hasCls('disabled')) {
				if (e) {e.stopEvent();}
				return false;
			}

			if (this.isSubmitted()) {
				return this.resetBasedOnButtonClick(e);
			}
		}

		if (!q.fireEvent('beforesubmit', q, submission)) {
			console.log('submit aborted');
			return;
		}



		this.fireEvent(isAssignment ? 'submit-assignment' : 'grade-it', this, q, submission);

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	setGradingResult: function(assessedQuestionSet) {
		this.questionSet.fireEvent('graded', assessedQuestionSet);
	},


	syncTop: function() {
		if (this.shouldShow) {
			this.show();
		}
		this.callParent();
	}
});
