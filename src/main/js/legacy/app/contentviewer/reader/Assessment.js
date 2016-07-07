var Ext = require('extjs');
var {guidGenerator, isMe, swallow} = require('legacy/util/Globals');
var DomUtils = require('legacy/util/Dom');
var ParseUtils = require('legacy/util/Parsing');
var TimeUtils = require('legacy/util/Time');

require('legacy/app/assessment/Scoreboard');
require('legacy/app/assessment/SurveyHeader');
require('legacy/app/assessment/Question');
require('legacy/app/assessment/Poll');
require('legacy/app/assessment/QuizSubmission');
require('legacy/app/assessment/AssignmentFeedback');
require('legacy/app/course/assessment/AssignmentStatus');


module.exports = exports = Ext.define('NextThought.app.contentviewer.reader.Assessment', {
	alias: 'reader.assessment',

	uses: [
		'NextThought.app.contentviewer.reader.ComponentOverlay'
	],

	constructor: function (config) {
		Ext.apply(this, config);
		this.reader.on('set-content', 'injectAssessments', this);
	},

	makeAssessmentPoll: function (p, set) {
		var contentElement = this.getContentElement('object', 'data-ntiid', p.getId()),
			o = this.reader.getComponentOverlay();

		//See below
		p.getVideos = Ext.bind(DomUtils.getVideosFromDom, DomUtils, [contentElement]);

		o.registerOverlayedPanel(p.getId(), Ext.widget('assessment-poll', {
			reader: this.reader,
			question: p,
			poll: p,
			renderTo: o.componentOverlayEl,
			questionSet: set || null,
			survey: set || null,
			tabIndexTracker: o.tabIndexer,
			contentElement: contentElement
		}));

		if (contentElement) {
			Ext.fly(contentElement).set({
				'data-used': true
			});
		}
	},

	makeAssessmentQuestion: function (q, set) {
		var contentElement = this.getContentElement('object', 'data-ntiid', q.getId()),
			o = this.reader.getComponentOverlay();

		//CUTZ override getVideos to pull things from the dom for now.
		//The model expects the videos in the assessment json which doesn't
		//sound like its going to happen anytime soon.
		q.getVideos = Ext.bind(DomUtils.getVideosFromDom, DomUtils, [contentElement]);

		o.registerOverlayedPanel(q.getId(), Ext.widget('assessment-question', {
			reader: this.reader,
			question: q,
			renderTo: o.componentOverlayEl,
			questionSet: set || null,
			tabIndexTracker: o.tabIndexer,
			contentElement: contentElement
		}));

		if (contentElement) {
			Ext.fly(contentElement).set({
				'data-used': true
			});
		}
	},

	makeAssessmentSurvey: function (survey, guid) {
		var me = this,
			o = me.reader.getComponentOverlay(),
			c = o.componentOverlayEl,
			r = me.reader,
			questions = survey.get('questions') || [],
			historyLink = survey.getLink('History'),
			reportLink = survey.getReportLink();

		this.surveyHeader = o.registerOverlayedPanel(guid + 'submission', Ext.widget('assessent-survey-header', {
			reader: r, renderTo: c, survey: survey,
			tabIndexTracker: o.tabIndexer
		}));

		questions.forEach(function (poll) {
			me.makeAssessmentPoll(poll, survey);
		});

		if (!historyLink && !survey.get('isClosed')) {
			this.submission = o.registerOverlayedPanel(guid + 'submission', Ext.widget('assessment-quiz-submission', {
				reader: r, renderTo: c, questionSet: survey,
				tabIndexTracker: o.tabIndexer,
				history: null, isInstructor: null
			}));
		} else {
			Service.request(historyLink)
				.then(function (response) {
					return ParseUtils.parseItems(response)[0];
				})
				.then(function (history) {
					survey.fireEvent('graded', history.get('Submission'));
				});
		}
	},

	makeAssessmentQuiz: function (set, guid) {
		var me = this,
			isInstructor = this.isInstructorProspective,
			completed,
			h = me.injectedAssignmentHistory,
			o = me.reader.getComponentOverlay(),
			c = o.componentOverlayEl,
			r = me.reader,
			questions = set.get('questions'),
			pendingAssessment;

		function getPendingAssessment (history) {
			var temp;

			try {
				temp = history.get('pendingAssessment').get('parts')[0];
			} catch (e) {
				swallow(e);
			}

			if (isInstructor) {
				temp = temp || NextThought.model.assessment.AssessedQuestionSet.from(set);
			}

			return temp;
		}

		if (h) {
			pendingAssessment = getPendingAssessment(h);
			set.noMark = Boolean(pendingAssessment && pendingAssessment.noMark);
		}

		o.registerOverlayedPanel(guid + 'scoreboard', Ext.widget('assessment-scoreboard', {
			reader: r, renderTo: c, questionSet: set,
			tabIndexTracker: o.tabIndexer
		}));

		set.isAssignment = !!this.injectedAssignment;

		Ext.each(questions, function (q) {me.makeAssessmentQuestion(q, set);});

		this.submission = o.registerOverlayedPanel(guid + 'submission', Ext.widget('assessment-quiz-submission', {
			reader: r, renderTo: c, questionSet: set,
			tabIndexTracker: o.tabIndexer,
			history: h, isInstructor: this.isInstructorProspective
		}));

		completed = h && h.get('Completed');

		if (this.injectedAssignment && this.injectedAssignment.isTimed && !isInstructor && !completed) {
			this.showAssignmentTimer(this.submission.shouldAllowSubmit && this.submission.shouldAllowSubmit.bind(this.submission));
		}

		if ((h && h.isSubmitted()) || pendingAssessment) {
			this.submission.setGradingResult(pendingAssessment);
		} else if (this.injectedSavePoint) {
			this.submission.setFromSavePoint(this.injectedSavePoint);
		}
	},

	updateAssessmentHistory: function (history) {
		var setId = this.injectedAssignment.getId(),
			historyItem = setId && history.getItem(setId);

		if (historyItem) {
			//if this is a timed assignment update the metadata with the one from the history item
			if (this.injectedAssignment.isTimed) {
				this.injectedAssignment.updateMetaData(historyItem.get('Metadata'));
			}

			this.injectedAssignmentHistory.set('history', historyItem);

			if (this.feedback) {
				this.feedback.setHistory(historyItem);
			}
		}
	},

	updateAssignmentHistoryItem: function (historyItem) {
		//Check history item is for injectedAssignment
		var assignmentId = this.injectedAssignment.getId(),
			grade = historyItem.get('Grade'),
			historyAssignmentId = grade.get('AssignmentId');

		this.injectedAssignmentHistory = historyItem;

		if (historyItem && (assignmentId === historyAssignmentId)) {
			if (this.injectedAssignment.isTimed) {
				this.injectedAssignment.updateMetaData(historyItem.get('Metadata'));
			}

			if (this.feedback) {
				this.feedback.setHistory(historyItem);
			}

			if (this.submission) {
				this.submission.historyUpdated();
			}
		}

	},

	showAssignmentTimer: function (submitFn) {
		var me = this,
			max = me.injectedAssignment.getMaxTime();

		me.injectedAssignment.getTimeRemaining()
			.then(function (remaining) {
				me.reader.showRemainingTime(remaining, max, submitFn);
			});
	},

	__goBackToAssignment: function (assignment) {
		var me = this;

		CourseWareUtils.findCourseBy(assignment.findMyCourse())
			.then(function (instance) {
				instance = instance.get('CourseInstance') || instance;

				return instance.fireNavigationEvent(me.reader);
			})
			.then(function () {
				me.reader.fireEvent('navigate-to-assignment', assignment.getId());
			})
			.catch(function (reason) {
				console.error('Failed to go back to assignment', reason);
			});
	},

	notSubmittedTimed: function () {
		var me = this,
			assignment = me.injectedAssignment,
			overrides = {week: 'Week', day: 'Day', hour: 'Hour', minute: 'Minute', second: 'Second'},
			title = assignment && assignment.get('title'), time;

		return assignment.getTimeRemaining()
			.then(function (remaining) {
				if (remaining < 0) {
					time = TimeUtils.getTimePartsFromTime(-1 * remaining);
					remaining = NextThought.app.course.assessment.AssignmentStatus.getTimeString(time) + ' Over';
				} else {
					time = TimeUtils.getTimePartsFromTime(remaining);
					remaining = NextThought.app.course.assessment.AssignmentStatus.getTimeString(time, true) + ' Remaining';
				}

				return new Promise(function (fulfill, reject) {
					Ext.Msg.show({
						title: remaining,
						msg: title + ' is a timed assignment, and is still in progress. Be sure to submit the assignment before time runs out.',
						buttons: {
							primary: {
								cls: 'caution',
								text: 'Leave',
								handler: fulfill
							},
							secondary: {
								text: 'Stay',
								handler: reject
							}
						}
					});
				});
			});
	},

	notSubmitted: function () {
		var me = this,
			assignment = me.injectedAssignment,
			title = (assignment && assignment.get('title')),
			progress = ' Your progress has been saved and can be resumed at a later date.',
			due = assignment ? 'It is due on ' + Ext.Date.format(assignment.getDueDate(), 'l, F j') + '.' : '';


		return new Promise(function (fulfill, reject) {
			Ext.Msg.show({
				title: 'Are you sure?',
				msg: 'You left ' + title + ' without submitting it. ' + progress,
				buttons: {
					primary: {
						cls: 'caution',
						text: 'Leave',
						handler: fulfill
					},
					secondary: {
						text: 'Stay',
						handler: reject
					}
				}
			});
		});
	},

	progressLostAlert: function () {
		var assignment = this.injectedAssignment,
			title = (assignment && assignment.get('title')),
			progress = ' Your progress will be lost.',
			due = assignment ? 'It is due on ' + Ext.Date.format(assignment.getDueDate(), 'l, F j') + '.' : '';

		return new Promise(function (fulfill, reject) {
			Ext.Msg.show({
				title: 'Are you sure?',
				msg: title + ' has not been submitted for grading. ' + due + progress,
				buttons: {
					primary: {
						cls: 'caution',
						text: 'Leave',
						handler: fulfill
					},
					secondary: {
						text: 'Stay',
						handler: reject
					}
				}
			});
		});
	},

	allowNavigation: function () {
		//If there is no submission or we have no assignment (self-assessment)
		//don't prevent navigation.	 TODO what if we are opening a note on something
		//like an assignment.  We would probably want to allowNavigation in that case.
		//Seems like we need to pass some more information to this method or have
		//the framework support that in another way.
		if (!this.submission || !this.injectedAssignment) {
			return true;
		}

		var assignment = this.injectedAssignment,
			hasAnswers = this.submission.hasAnyAnswers(),
			missingAnswers = this.submission.hasAnyMissing(),
			isSubmitted = this.submission.isSubmitted(),
			progressSaved = this.submission.hasProgressSaved();

		if (isSubmitted || this.isInstructorProspective) {
			return Promise.resolve();
		}

		if (assignment && assignment.isTimed) {
			return this.notSubmittedTimed();
		}

		if (hasAnswers && !progressSaved) {
			return this.progressLostAlert();
		}

		if (!missingAnswers) {
			return this.notSubmitted();
		}

		return Promise.resolve();
	},

	beforeRouteChange: function () {
		if (this.submission) {
			this.submission.beforeRouteChange();
		}
	},

	showSavingProgress: function () {
		if (this.progressToast && !this.progressToast.el.isDestroyed) {
			console.warn('Toast already open');
		} else {
			this.progressToast = this.reader.showHeaderToast({
				text: 'Saving Progress',
				cls: 'saving',
				minTime: 3000
			});
		}
	},

	showProgressSaved: function () {
		var toast = this.progressToast;

		if (!toast) { return; }

		toast.openLongEnough
			.then(function () {
				//the toast got destroyed by something else
				if (!toast.el || toast.isDestroyed) {
					return;
				}

				toast.el.addCls('saved');
				toast.el.removeCls('saving');
				toast.el.update('Progress Saved');

				toast.close(1500);

			});
	},

	showProgressFailed: function () {
		var toast = this.progressToast;

		if (!toast) { return; }

		toast.openLongEnough
			.then(function () {
				//the toast got destroyed by something else
				if (!toast.el || toast.isDestroyed) {
					return;
				}

				toast.el.addCls('error');
				toast.el.removeCls('saving');
				toast.el.update('Failed to Save Progress');

				toast.close(3000);
				return wait(5000);
			});
	},

	shouldStudentAllowReset: function () {
		var history,
			injectedHistory = this.injectedAssignmentHistory,
			allow = true;

		//instructors don't get the reset option here
		if (this.isInstructorProspective) {
			allow = false;
		//if we have an assignment but not an assignment history default to false
		} else if (this.injectedAssignment && !this.injectedAssignmentHistory) {
			allow = false;
		} else if (this.injectedAssignmentHistory) {
			//otherwise if the injected history has allowReset allow it
			history = injectedHistory.get('history') || injectedHistory;
			allow = history && history.allowReset && !!history.allowReset();
		}

		return allow;
	},

	resetAssignment: function () {
		var me = this,
			history = me.injectedAssignmentHistory.get('history') || me.injectedAssignmentHistory,
			reset = history && history.resetAssignment ? history.resetAssignment(isMe(history.get('Creator'))) : Promise.reject();

		return reset
			.then(function (deleted) {
				if (deleted && me.feedback) {
					me.feedback.hide();
				}

				return deleted;
			});
	},

	wasReset: function () {
		if (this.feedback) {
			this.feedback.hide();
		}
	},

	forceSubmitted: function () {
		var history = this.injectedAssignmentHistory;

		this.feedback.setHistory(history);
	},

	injectAssignmentSavePoint: function (point) {
		this.injectedSavePoint = point;

		if (this.submission) {
			this.submission.setFromSavePoint(point);
		}
	},

	injectAssessments: function (reader, doc, items) {
		var me = this,
			slice = Array.prototype.slice,
			questionObjs, pollObjs,
			r = me.reader,
			h = me.injectedAssignmentHistory,
			o = r.getComponentOverlay(),
			c = o.componentOverlayEl,
			guid = guidGenerator();

		//nothing to do.
		if (!items || items.length < 1) {
			return;
		}

		new Ext.dom.CompositeElement(
			doc.querySelectorAll('.x-btn-submit,[onclick^=NTISubmitAnswers]')).remove();

		questionObjs = slice.call(doc.querySelectorAll('object[type*=naquestion][data-ntiid]'));

		//For polls just treat them exactly like we do questions
		pollObjs = slice.call(doc.querySelectorAll('object[type*=napoll][data-ntiid]'));

		Ext.Array.sort(items, function (ar, br) {
			var a = questionObjs.indexOf(me.getRelatedElement(ar.get('NTIID'), questionObjs)),
				b = questionObjs.indexOf(me.getRelatedElement(br.get('NTIID'), questionObjs));
			return ((a === b) ? 0 : ((a > b) ? 1 : -1));
		});

		if (pollObjs.length) {
			Ext.Array.sort(items, function (ar, br) {
				var a = pollObjs.indexOf(me.getRelatedElement(ar.get('NTIID'), pollObjs)),
					b = pollObjs.indexOf(me.getRelatedElement(br.get('NTIID'), pollObjs));

				return ((a === b) ? 0 : ((a > b) ? 1 : -1));
			});
		}


		if (questionObjs.length) {
			Ext.each(this.cleanQuestionsThatAreInQuestionSets(items, questionObjs), function (q) {
				if (q.isSet) { me.makeAssessmentQuiz(q, guid); }
				else { me.makeAssessmentQuestion(q); }
			});
		}


		if (pollObjs.length) {
			Ext.each(this.cleanQuestionsThatAreInQuestionSets(items, pollObjs), function (p) {
				if (p.isSet) {
					me.makeAssessmentSurvey(p, guid);
				} else {
					me.makeAssessmentPoll(p);
				}
			});
		}

		slice.call(doc.querySelectorAll('object[type*=naquestion][data-ntiid]:not([data-used])')).forEach(function (e) {
			e.parentNode.removeChild(e);
		});

		if (!(h instanceof NextThought.model.courseware.UsersCourseAssignmentHistoryItem)) {
			h = h && (h.get('history') || h);
		}

		if (me.injectedAssignment) {
			me.feedback = o.registerOverlayedPanel(guid + 'feedback', Ext.widget('assignment-feedback', {
				reader: r, renderTo: c,
				noSubmit: me.injectedAssignment.isNoSubmit(),
				tabIndexTracker: o.tabIndexer,
				history: h
			}));
		}
	},

	isAssignment: function () {
		return !!this.injectedAssignment;
	},

	setAssignmentFromInstructorProspective: function (assignment, history) {
		this.isInstructorProspective = true;
		this.injectedAssignment = assignment;
		this.injectedAssignmentHistory = history;
	},

	setAssignmentFromStudentProspective: function (assignment, history) {
		this.injectedAssignment = assignment;
		this.injectedAssignmentHistory = history;
	},

	cleanQuestionsThatAreInQuestionSets: function (items, objects) {
		items = items.slice();
		//move assignments to the front.
		items.sort(function (a, b) {
			var c = a.isAssignment,
				d = b.isAssignment;
			return c === d ? 0 : (c && !d) ? -1 : 1;
		});

		var result = [],
			questionsInSets = [],
			push = Array.prototype.push,
			injectedAssignment = this.injectedAssignment,
			sets = {},
			assignments = [],
			usedQuestions = {};

		function inSet (id) {
			var i = questionsInSets.length - 1;
			for (i; i >= 0; i--) {
				if (id === questionsInSets[i].getId()) {
					return true;
				}
			}
			return false;
		}
		function hasElement (id) {
			var i;
			for (i = 0; i < objects.length; i++) {
				if (objects[i] && typeof objects[i] !== 'string') {
					objects[i] = objects[i].getAttribute('data-ntiid');
				}
				if (objects[i] === id) { return true; }
			}
			return false;
		}

		function pushSetQuestions (i) {
			if (i.isSet) { push.apply(questionsInSets, i.get('questions')); }
		}

		if (injectedAssignment) {
			assignments.push(injectedAssignment);
		}


		//get sets
		items.forEach(pushSetQuestions);

		items.forEach(function (i) {
			if (i.isAssignment) {
				assignments.push(i);

				(i.get('parts') || []).forEach(function (qset) {
					qset = qset.get('question_set');
					sets[qset.getId()] = qset;
					pushSetQuestions(qset);
					result.push(qset);
				});
			}
			//work around dups
			if (i.isSet) {
				if (sets[i.getId()]) {return;}
				sets[i.getId()] = i;
			}
			if (i.isSet || (!inSet(i.getId()) && i.getId && !usedQuestions[i.getId()] && hasElement(i.getId()))) {
				result.push(i);
				usedQuestions[i.getId()] = true;
			}
		});

		//Let question sets know they're part of an assignment.
		assignments.forEach(function (a) {
			(a.get('parts') || []).forEach(function (p) {
				var s = p.get('question_set');
				s = (s && sets[s.getId()]);

				//Try to keep the instance of the injectedAssignment the
				//same between all the views
				if (a.getId() === injectedAssignment.getId()) {
					a = injectedAssignment;
				}

				if (s) {
					s.associatedAssignment = a;
				}
			});
		});

		return result;
	},

	getFeedbackContentEl: function () {
		return this.feedback && this.feedback.contentElement;
	}
}, function () {
	var c = NextThought.app.contentviewer.reader.ComponentOverlay.prototype;
	Ext.copyTo(this.prototype, c, ['getRelatedElement', 'getContentElement']);
});
