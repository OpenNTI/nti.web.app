/*globals getFormattedString:false*/
Ext.define('NextThought.app.assessment.QuizSubmission', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.assessment-quiz-submission',

	requires: [
		'NextThought.app.assessment.Actions'
	],

	cls: 'submission-panel',
	ui: 'assessment',
	appendPlaceholder: true,
	hidden: true,
	shouldShow: true,
	//layout: 'none',
	componentLayout: Ext.isIE10m ? undefined : 'auto',

	/* Because we're inheriting from a "Panel" to get the special handling provided by the super class, we can't use
	 * our typical renderTpl. Instead we're going to take advantage of the Ext.panal.Panel's html config property...
	 *
	 * We don't normally do this for our custom widgets, because the Panel is a fairly heavy weight component, so don't
	 * use this class as an exmaple of how to make custom components.
	 */
	html: Ext.DomHelper.markup([
		{ cls: 'buttons', cn: [
			{tag: 'a', href: '#', cls: 'reset', html: getString('NextThought.view.assessment.QuizSubmission.cancel')},
			{tag: 'a', href: '#', cls: 'submit tabable disabled', html: getString('NextThought.view.assessment.QuizSubmission.finished')}
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
			'do-submission': 'submitClicked',
			'save-progress': 'saveProgress'
		});

		Ext.each(this.questionSet.get('questions'), function(q) {
			var questionMap = {};

			Ext.each(q.get('parts'), function(p) {
				questionMap[p.id] = 0;
			});

			answeredMap[q.getId()] = questionMap;
		});

		this.answeredMap = answeredMap;
		this.startTimestamp = new Date().getTime();

		if (this.questionSet.associatedAssignment) {
			this.questionSet.addSaveProgressHandler(this.saveProgress.bind(this), this.beforeSaveProgress.bind(this), this.afterSaveProgress.bind(this));
		}

		this.questionSet.setStartTime(this.startTimestamp);
		this.questionSet.clearProgress();

		this.AssessmentActions = NextThought.app.assessment.Actions.create();
	},


	afterRender: function() {
		this.callParent(arguments);
		this.resetBtn.hide();
		this.reflectStateChange();
		this.mon(this.resetBtn, 'click', this.resetClicked, this);
		this.mon(this.submitBtn, 'click', this.submitClicked, this);

		var me = this,
			r = me.resetBtn,
			s = me.submitBtn,
			t = me.tabIndexTracker;

		function setTabIndex(el, attr) {
			if (el.dom) {
				el.set(attr);
			}
		}

		setTimeout(function() {
			try {
				setTabIndex(s, {tabIndex: t.getNext()});
				setTabIndex(r, {tabIndex: t.getNext()});
			} catch (e) {
				if (!me.isDestroyed) {
					throw e;
				}
			}
		},1);

		me.fireEvent('has-been-submitted', me);

		if (me.isInstructor && me.history) {
			me.mon(me.history, {
				'was-destroyed': me.instructorReset.bind(me),
				'force-submission': me.forceSubmitted.bind(me)
			});
		}
	},


	isActive: function() {
		return this.state === 'active';
	},


	isInActive: function() {
		return !this.state || this.state === 'inactive';
	},


	isSubmitted: function() {
		return this.state === 'submitted' || this.submitted;
	},


	isReady: function() {
		return !this.isActive() && !this.isSubmitted;
	},


	disableView: function() {
		if (!this.allowResettingAssignment) {
			this.shouldShow = false;
			this.hide();
		}
	},

	moveToActive: function() {
		if (this.isActive()) {
			return;
		}

		if (this.questionSet.associatedAssignment && this.submitted) {
			return;
		}

		delete this.allowResettingAssignment;
		console.log('New status is active');
		this.state = 'active';
		this.resetBtn.show();
		this.statusMessage.show();
		this.submitBtn.update(getString('NextThought.view.assessment.QuizSubmission.finished'));
		this.submitBtn.removeCls('disabled');
		if (this.shouldShow) {
			this.show();
		}
	},


	moveToInActive: function() {
		if (this.isInActive()) {
			return;
		}

		if (this.questionSet.associatedAssignment && this.submitted) {
			return;
		}

		this.state = 'inactive';
		this.resetBtn.hide();
		this.statusMessage.show();
		this.submitBtn.update(getString('NextThought.view.assessment.QuizSubmission.finished'));
		this.submitBtn.addCls('disabled');

		if (this.shouldShow) {
			this.show();
		}
	},


	moveToSubmitted: function() {
		var isAssignment = !!this.questionSet.associatedAssignment,
			assessmentReader = this.reader.getAssessment(),
			allowReset = assessmentReader.shouldStudentAllowReset();

		//if we aren't an assignment and we are already marked submitted don't do it again
		if (!isAssignment && this.isSubmitted()) {
			return;
		}

		//if we are an assignment that doesn't allow resetting hide
		if (isAssignment && !allowReset) {
			this.shouldShow = false;
			delete this.allowResettingAssignment;
			this.hide();
		} else {
			this.shouldShow = true;
			this.allowResettingAssignment = true;
			this.show();
		}

		console.log('New status is submitted');
		this.state = 'submitted';
		this.submitted = true;
		this.resetBtn.hide();
		this.statusMessage.hide();
		this.submitBtn.update(getString('NextThought.view.assessment.QuizSubmission.redo'));
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


	//just use us being in the active state to determine if
	//we have any answers
	hasAnyAnswers: function() {
		return this.isActive();
	},


	hasAnyMissing: function() {
		return !this.noParts && !this.allQuestionsAnswered;
	},


	hasProgressSaved: function() {
		return this.progressSaved;
	},


	updateStatus: function(question, part, count, enabling) {
		if (enabling) {
			this.moveToActive();
		}

		if (!Ext.isNumber(count)) {
			count = count ? 1 : 0;
		}

		this.answeredMap[question.getId()][part.id] = count;
		this.reflectStateChange();
		return status;
	},


	historyUpdated: function() {
		if (this.submitted) {
			this.submitted = false;
			this.moveToSubmitted();
		}
	},


	reflectStateChange: function() {
		var totalAnsweredParts = 0,
			totalParts = 0,
			answeredQuestions = 0,
			totalQuestions = 0,
			newStatus;

		Ext.Object.each(this.answeredMap, function(key, parts) {
			var answeredParts = 0, partsCount = 0;

			Ext.Object.each(parts, function(id, done) {
				partsCount += 1;

				answeredParts += done || 0;
			});

			totalAnsweredParts += answeredParts;
			totalParts += partsCount;

			if (answeredParts === partsCount) {
				answeredQuestions += 1;
			}

			totalQuestions += 1;
		});

		if (totalAnsweredParts === 0) {
			this.moveToInActive();
		} else {
			this.moveToActive();
		}

		if (totalQuestions === 0) {
			this.noParts = true;
		}

		if (answeredQuestions === totalQuestions) {
			newStatus = getString('NextThought.view.assessment.QuizSubmission.all-answered');
			this.allQuestionsAnswered = true;
			this.statusMessage.addCls('ready');
		} else {
			newStatus = getFormattedString('NextThought.view.assessment.QuizSubmission.unanswered', {
							questions: Ext.util.Format.plural(totalQuestions - answeredQuestions, 'question')
						});
			this.allQuestionsAnswered = false;
			this.statusMessage.removeCls('ready');
		}

		this.statusMessage.update(newStatus);

		this.unansweredQuestions = totalQuestions - answeredQuestions;

		if (this.submitChangedHandler) {
			this.submitChangedHandler.call(null, this.shouldAllowSubmit(this.submitChangedHandler));
		}
	},


	reset: function() {
		this.moveToReady();
	},


	graded: function() {
		this.moveToSubmitted();
	},


	instructorReset: function() {
		var assessmentReader = this.reader.getAssessment();

		assessmentReader.wasReset();
		this.questionSet.fireEvent('instructor-reset');
	},


	forceSubmitted: function() {
		var assessmentReader = this.reader.getAssessment();

		assessmentReader.forceSubmitted();

		this.setGradingResult(null, this.history);
	},


	maybeDoReset: function(keepAnswers) {
		var me = this,
			q = me.questionSet,
			isAssignment = q.associatedAssignment,
			assessmentReader = me.reader.getAssessment();

		if (me.resetting) {return Promise.reject();} //some how we're getting called repeatedly...lets not fire an infinte loop of events.

		function finish() {
			try {
				if (q.fireEvent('beforereset')) {
					q.fireEvent('reset', keepAnswers);
					q.clearProgress(true);
					console.log('fired reset');
					return Promise.resolve();
				}

				console.log('reset aborted');
				return Promise.reject();
			} finally {
				delete me.resetting;
			}

		}

		me.resetting = true;

		//if we are in an assignment that allows itself to be reset and
		//keep answers is true, which means we are resetting from a submitted state
		//as opposed to clearing out the current answers
		if (isAssignment && assessmentReader && assessmentReader.shouldStudentAllowReset() && keepAnswers) {
			return assessmentReader.resetAssignment()
				.then(function(deleted) {
					if (deleted) {
						me.fireEvent('assignment-reset');
						me.reset();
						me.moveToActive();
						return finish();
					}

					return Promise.reject();
				})
				.fail(function(reason) {
					delete me.resetting;

					 alert('We are unable to reset your assignment at this time.');

					return Promise.reject(reason);
				});
		} else {
			return finish();
		}
	},


	resetBasedOnButtonClick: function(e) {
		//If we are in a submitted state we want to reset things
		var me = this;

		me.maybeDoReset(true)
			.then(function() {
				me.reader.getScroll().to(0);
			});

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	resetClicked: function(e) {
		var me = this;

		if (me.isSubmitted()) {
			return me.resetBasedOnButtonClick(e);
		}

		Ext.MessageBox.alert({
			title: getString('NextThought.view.assessment.QuizSubmission.warning-title'),
			msg: getString('NextThought.view.assessment.QuizSubmission.warning-msg'),
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				primary: {
					name: 'yes',
					cls: 'caution',
					text: getString('NextThought.view.assessment.QuizSubmission.yes')
				},
				secondary: {
					name: 'cancel',
					text: getString('NextThought.view.assessment.QuizSubmission.cancel')
				}
			},
			fn: function(button) {
				if (button === 'yes') {
					me.maybeDoReset(false);
				}
			}
		});

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	beforeSaveProgress: function() {
		var assessmentReader = this.reader.getAssessment();

		if (this.isInstructor) { return; }
		assessmentReader.showSavingProgress();
	},


	afterSaveProgress: function(success) {
		var assessmentReader = this.reader.getAssessment();

		this.progressSaved = success;

		assessmentReader[success ? 'showProgressSaved' : 'showProgressFailed']();
	},


	saveProgress: function(progress) {
		if (this.isInstructor) {
			return Promise.reject();
		}

		return this.AssessmentActions.saveProgress(this.questionSet, progress, this.startTimestamp);
	},


	beforeRouteChange: function() {
		var submission = {};

		this.questionSet.fireEvent('beforesubmit', this.questionSet, submission);

		this.saveProgress(submission);
	},


	shouldAllowSubmit: function(onChangeHandler) {
		var enabled;

		if (this.shouldShow) {
			if (!this.submitBtn || this.submitBtn.hasCls('disabled')) {
				enabled = false;
			} else {
				enabled = true;
			}

			if (this.isSubmitted()) {
				enabled = false;
			}
		}

		this.submitChangedHandler = onChangeHandler;

		return {
			enabled: enabled,
			unanswered: this.unansweredQuestions,
			submitFn: this.submitClicked.bind(this)
		};
	},


	submitClicked: function(e) {
		var questionSet = this.questionSet,
			isAssignment = !!questionSet.associatedAssignment,
			submission = {};

		if (this.shouldShow) {
			if (!this.submitBtn || this.submitBtn.hasCls('disabled')) {
				if (e) { e.stopEvent(); }

				return false;
			}

			if (this.isSubmitted()) {
				return this.resetBasedOnButtonClick(e);
			}
		}

		if (!questionSet.fireEvent('beforesubmit', questionSet, submission)) {
			console.log('submit aborted');
			return;
		}

		Ext.getBody().mask(getString('Submitting...'), 'navigation');

		if (isAssignment) {
			this.submitAssignment(questionSet, submission);
		} else if (questionSet instanceof NextThought.model.assessment.Survey) {
			this.submitSurvey(questionSet, submission);
		} else {
			this.submitAssessment(questionSet, submission);
		}

		if (e) {
			e.stopEvent();
			return false;
		}
	},


	submitAssignment: function(questionSet, submission) {
		var me = this,
			container = me.reader.getLocation().NTIID;

		me.mask();

		me.AssessmentActions.submitAssignment(questionSet, submission, container, me.startTimestamp)
			.then(function(obj) {
				var result = obj.result;

				me.unmask();
				me.setGradingResult(result);

				me.reader.fireEvent('assignment-submitted', obj.assignmentId, obj.itemLink);
			}, function() {
				me.onFailure();
				me.maybeDoReset(true);
				me.unmask();
			});
	},


	submitAssessment: function(questionSet, submission) {
		var me = this,
			container = me.reader.getLocation().NTIID;

		me.mask();

		me.AssessmentActions.gradeAssessment(questionSet, submission, container, me.startTimestamp)
			.then(function(result) {
				me.setGradingResult(result);

				me.unmask();
				me.reader.fireEvent('assessment-graded', result);
			}, function() {
				me.unmask();
				me.onFailure();
			});
	},


	submitSurvey: function(questionSet, submission) {
		var me = this,
			container = me.reader.getLocation().NTIID;

		me.mask();

		me.AssessmentActions.submitSurvey(questionSet, submission, container, me.startTimeStamp)
			.then(function(result) {
				me.setGradingResult(result.get('Submission').get('Submission'));

				me.unmask();

				me.reader.fireEvent('survey-submitted', result);
			}, function() {
				me.onFailure();
				me.maybeDoReset(true);
				me.unmask();
			});
	},


	setFromSavePoint: function(savepoint) {
		var submission = savepoint && savepoint.getQuestionSetSubmission();

		if (savepoint && !this.assessmentHistory) {
			this.progressSaved = true;
			this.questionSet.fireEvent('set-progress', submission);
			this.questionSet.setPreviousEffortDuration(submission.get('CreatorRecordedEffortDuration'));
		}
	},


	setGradingResult: function(assessedQuestionSet, assessmentHistory) {
		this.assessmentHistory = assessmentHistory;
		try {
			assessedQuestionSet = assessedQuestionSet || NextThought.model.assessment.AssessedQuestionSet.from(this.questionSet);
			this.questionSet.fireEvent('graded', assessedQuestionSet);
			Ext.getBody().unmask();
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	},


	onFailure: function() {
		try {
			Ext.getBody().unmask();
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	},


	syncTop: function() {
		if (this.shouldShow) {
			this.show();
		}
		this.callParent();
	}
});
