Ext.define('NextThought.view.assessment.QuizSubmission', {
	extend:   'NextThought.view.content.overlay.Panel',
	alias:    'widget.assessment-quiz-submission',
	requires: [
	],

	cls:               'submission-panel',
	ui:                'assessment',
	appendPlaceholder: true,
	hidden:            true,

	/* Because we're inheriting from a "Panel" to get the special handling provided by the super class, we can't use
	 * our typical renderTpl. Instead we're going to take advantage of the Ext.panal.Panel's html config property...
	 *
	 * We don't normally do this for our custom widgets, because the Panel is a fairly heavy weight component, so don't
	 * use this class as an exmaple of how to make custom components.
	 */
	html:              Ext.DomHelper.markup([
												{ cls: 'buttons', cn: [
													{tag: 'a', href: '#', cls: 'reset', html: 'Cancel'},
													{tag: 'a', href: '#', cls: 'submit tabable disabled', html: 'I\'m Finished!'}
												] },
												{ cls: 'status' }
											]),

	renderSelectors: {
		statusMessage: '.status',
		resetBtn:      '.reset',
		submitBtn:     '.submit'
	},

	initComponent: function () {
		var answeredMap = {};

		this.callParent(arguments);
		this.hide();
		this.mon(this.questionSet, {
			scope:      this,
			'answered': this.updateStatus,
			'reset':    this.reset,
			'graded':   this.graded
		});

		Ext.each(this.questionSet.get('questions'), function (q) {
			answeredMap[q.getId()] = false;
		});

		this.answeredMap = answeredMap;
	},

	afterRender: function () {
		this.callParent(arguments);
		this.resetBtn.hide();
		this.reflectStateChange();
		this.mon(this.resetBtn, 'click', this.resetClicked, this);
		this.mon(this.submitBtn, 'click', this.submitClicked, this);
		var r = this.resetBtn,
				s = this.submitBtn,
				t = this.tabIndexTracker;
		setTimeout(function () {
			s.set({tabIndex: t.getNext()});
			r.set({tabIndex: t.getNext()});
		}, 1);
	},

	isActive: function () {
		return this.state === 'active';
	},

	isSubmitted: function () {
		return this.state === 'submitted';
	},

	isReady: function () {
		return !this.isActive() && !this.isSubmitted;
	},

	moveToActive: function () {
		if (this.isActive()) {
			return;
		}
		console.log('New status is active');
		this.state = 'active';
		this.resetBtn.show();
		this.statusMessage.show();
		this.submitBtn.update('I\'m Finished');
		this.submitBtn.removeCls('disabled');
	},

	moveToSubmitted: function () {
		if (this.isSubmitted()) {
			return;
		}
		console.log('New status is submitted');
		this.state = 'submitted';
		this.submitted = true;
		this.resetBtn.hide();
		this.statusMessage.hide();
		this.submitBtn.update('Try Again');
		this.submitBtn.removeCls('disabled');
	},

	moveToReady: function () {
		if (this.isReady()) {
			return;
		}
		console.log('New status is ready');
		delete this.state;
		delete this.submitted;
	},

	transitionToActive: function () {
		if (this.isSubmitted()) {
			this.maybeDoReset(true);
		}
		this.moveToActive();
	},

	updateStatus: function (question, part, status, enabling) {
		if (enabling) {
			this.transitionToActive();
		}
		this.answeredMap[question.getId()] = Boolean(status);
		this.reflectStateChange();
	},


	reflectStateChange: function () {
		var unanswered = 0;
		if (!this.rendered) {
			return;
		}

		Ext.Object.each(this.answeredMap, function (k, v) {
			if (!v) {
				unanswered++;
			}
		});
		this.statusMessage.update(unanswered === 0
										  ? 'All questions answered'
										  : Ext.String.format('{0} questions unanswered', unanswered)
		);

		this.statusMessage[((unanswered === 0) ? 'add' : 'remove') + 'Cls']('ready');
	},


	reset: function () {
		this.moveToReady();
	},


	graded: function () {
		this.moveToSubmitted();
	},


	maybeDoReset: function (keepAnswers) {
		var q = this.questionSet;
		if (q.fireEvent('beforereset')) {
			q.fireEvent('reset', keepAnswers);
			console.log('fired reset');
			return true;
		}

		console.log('reset aborted');
		return false;
	},

	resetBasedOnButtonClick: function (e) {
		//If we are in a submitted state we want to reset things
		if (this.maybeDoReset(true)) {
			this.reader.scrollTo(0);
		}

		if (e) {
			e.stopEvent();
			return false;
		}
	},

	resetClicked: function (e) {
		if (this.isSubmitted()) {
			return this.resetBasedOnButtonClick(e);
		}

		this.maybeDoReset(false);

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	submitClicked: function (e) {
		var q = this.questionSet,
				submission = {};

		if (!this.submitBtn || this.submitBtn.hasCls('disabled')) {
			e.stopEvent();
			return false;
		}

		if (this.isSubmitted()) {
			return this.resetBasedOnButtonClick(e);
		}

		if (!q.fireEvent('beforesubmit', q, submission)) {
			console.log('submit aborted');
			return;
		}

		this.fireEvent('grade-it', this, q, submission);

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	setGradingResult: function (assessedQuestionSet) {
		this.questionSet.fireEvent('graded', assessedQuestionSet);
	},


	syncTop: function () {
		this.show();
		this.callParent();
	}
});
