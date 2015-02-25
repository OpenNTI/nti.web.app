/*globals isMe:false, Toaster:false, swallow:false*/
Ext.define('NextThought.view.content.reader.Assessment', {
	alias: 'reader.assessment',
	requires: [
		'NextThought.view.assessment.Scoreboard',
		'NextThought.view.assessment.Question',
		'NextThought.view.assessment.QuizSubmission',
		'NextThought.view.assessment.AssignmentFeedback',
		'NextThought.view.courseware.assessment.AssignmentStatus'
	],

	uses: [
		'NextThought.view.content.reader.ComponentOverlay'
	],

	constructor: function(config) {
		Ext.apply(this, config);
		this.reader.on('set-content', 'injectAssessments', this);
	},


	makeAssessmentQuestion: function(q, set) {
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


	makeAssessmentQuiz: function(set, guid) {
		var me = this,
			isInstructor = this.isInstructorProspective,
			h = me.injectedAssignmentHistory,
			o = me.reader.getComponentOverlay(),
			c = o.componentOverlayEl,
			r = me.reader,
			questions = set.get('questions'),
			pendingAssessment;

		function getPendingAssessment(h) {
			var temp;

			try {
				temp = h.get('pendingAssessment').get('parts')[0];
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

		Ext.each(questions, function(q) {me.makeAssessmentQuestion(q, set);});

		this.submission = o.registerOverlayedPanel(guid + 'submission', Ext.widget('assessment-quiz-submission', {
			reader: r, renderTo: c, questionSet: set,
			tabIndexTracker: o.tabIndexer,
			history: h, isInstructor: this.isInstructorProspective
		}));

		if (this.injectedAssignment && this.injectedAssignment.isTimed && !h.get('completed') && !isInstructor) {
			this.showAssignmentTimer(this.submission.shouldAllowSubmit && this.submission.shouldAllowSubmit.bind(this.submission));
		}

		if (pendingAssessment) {
			this.submission.setGradingResult(pendingAssessment);
		} else if (this.injectedSavePoint) {
			this.submission.setFromSavePoint(this.injectedSavePoint);
		}
	},


	updateAssessmentHistory: function(history) {
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


	showAssignmentTimer: function(submitFn) {
		var me = this,
			max = me.injectedAssignment.getMaxTime(),
			remaining = me.injectedAssignment.getTimeRemaining();

		me.reader.showRemainingTime(remaining, max, submitFn);
	},


	__goBackToAssignment: function(assignment) {
		var me = this;

		CourseWareUtils.findCourseBy(assignment.findMyCourse())
			.then(function(instance) {
				instance = instance.get('CourseInstance') || instance;

				return instance.fireNavigationEvent(me.reader);
			})
			.then(function() {
				me.reader.fireEvent('navigate-to-assignment', assignment.getId());
			})
			.fail(function(reason) {
				console.error('Failed to go back to assignment', reason);
			});
	},


	notSubmittedTimedToast: function() {
		var me = this,
			assignment = me.injectedAssignment,
			remaining = assignment.getTimeRemaining(),
			overrides = {week: 'Week', day: 'Day', hour: 'Hour', minute: 'Minute', second: 'Second'},
			title = assignment && assignment.get('title'), time;

		if (remaining < 0) {
            time = TimeUtils.getTimePartsFromTime(-1 * remaining);
            remaining = NextThought.view.courseware.assessment.AssignmentStatus.getTimeString(time) + " Over";
		} else {
            time = TimeUtils.getTimePartsFromTime(remaining);
            remaining = NextThought.view.courseware.assessment.AssignmentStatus.getTimeString(time, true) + " Remaining";
		}

		if (!me.toast || me.toast.isDestroyed) {
			me.toast = Toaster.makeToast({
				title: remaining,
				message: title + ' is a timed assignment, and is still in progress. Be sure to submit the assignment before time runs out.',
				timeout: 10000,
				callback: function() {
					delete me.toast;
				},
				buttons: [
					{
						label: 'Take Me Back',
						callback: me.__goBackToAssignment.bind(me, assignment)
					}
				]
			});
		}

		return Promise.resolve();
	},


	notSubmittedToast: function() {
		var me = this,
			assignment = me.injectedAssignment,
			title = (assignment && assignment.get('title')),
			progress = ' Your progress has been saved and can be resumed at a later date.',
			due = assignment ? 'It is due on ' + Ext.Date.format(assignment.getDueDate(), 'l, F j') + '.' : '';

		if (!me.toast || me.toast.isDestroyed) {
			me.toast = Toaster.makeToast({
				//title: 'Did you mean to not submit that assignment?',
				message: 'You left ' + title + ' without submitting it. ' + progress,
				timeout: 10000,
				callback: function() {
					delete me.toast;
				},
				buttons: [
					{
						label: 'Take me Back',
						callback: me.__goBackToAssignment.bind(me, assignment)
					}
				]
			});
		}

		return Promise.resolve();
	},


	notSubmittedAlert: function() {
		var assignment = this.injectedAssignment,
			title = (assignment && assignment.get('title')),
			progress = ' Your progress will be lost.',
			due = assignment ? 'It is due on ' + Ext.Date.format(assignment.getDueDate(), 'l, F j') + '.' : '';

		return new Promise(function(fulfill, reject) {
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

	/**
	 * Let the user know when they leave an assignment that is not submitted if
	 * 1.) there are answers but no progress saved
	 * 2.) it is completely filled out but not submitted
	 * @param  {Boolean} forced if true the navigation behind it cannot be stopped
	 * @return {Promise}        fulfills if it is save to leave rejects otherwise
	 */
	stopClose: function(forced) {
		//if the reader isn't visible don't stop navigation
		//or if the quiz doesn't have a submission widget
		if (!this.reader.isVisible(true) || !this.submission) {
			return Promise.resolve();
		}

		var assignment = this.injectedAssignment,
			hasAnswers = this.submission.hasAnyAnswers(),
			missingAnswers = this.submission.hasAnyMissing(),
			isSubmitted = this.submission.isSubmitted(),
			progressSaved = this.submission.hasProgressSaved();

		if (isSubmitted || this.isInstructorProspective) {
			return Promise.resolve();
		}

		if (assignment.isTimed) {
			return this.notSubmittedTimedToast();
		}

		if (hasAnswers && !progressSaved && !forced) {
			return forced ? false : this.notSubmittedAlert();
		}

		if (!missingAnswers) {
			return this.notSubmittedToast();
		}

		return Promise.resolve();
	},


	showSavingProgress: function() {
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


	showProgressSaved: function() {
		var toast = this.progressToast;

		if (!toast) { return; }

		toast.openLongEnough
			.then(function() {
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


	showProgressFailed: function() {
		var toast = this.progressToast;

		if (!toast) { return; }

		toast.openLongEnough
			.then(function() {
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


	shouldAllowReset: function() {
		var history;

		if (!this.injectedAssignmentHistory) {
			return true;
		}

		history = this.injectedAssignmentHistory.get('history');

		return history && !!history.allowReset();
	},


	resetAssignment: function() {
		var me = this,
			history = me.injectedAssignmentHistory.get('history'),
			reset = history && history.resetAssignment ? history.resetAssignment(isMe(history.get('Creator'))) : Promise.reject();

		return reset
			.then(function(deleted) {
				if (deleted && me.feedback) {
					me.feedback.hide();
				}

				return deleted;
			});
	},


	wasReset: function() {
		if (this.feedback) {
			this.feedback.hide();
		}
	},


	forceSubmitted: function() {
		var history = this.injectedAssignmentHistory;

		this.feedback.setHistory(history);
	},


	injectAssignmentSavePoint: function(point) {
		this.injectedSavePoint = point;

		if (this.submission) {
			this.submission.setFromSavePoint(point);
		}
	},


	injectAssessments: function(reader, doc, items) {
		var me = this,
			slice = Array.prototype.slice,
			questionObjs,
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

		Ext.Array.sort(items, function(ar, br) {
			var a = questionObjs.indexOf(me.getRelatedElement(ar.get('NTIID'), questionObjs)),
				b = questionObjs.indexOf(me.getRelatedElement(br.get('NTIID'), questionObjs));
			return ((a === b) ? 0 : ((a > b) ? 1 : -1));
		});

		Ext.each(this.cleanQuestionsThatAreInQuestionSets(items, questionObjs), function(q) {
			if (q.isSet) { me.makeAssessmentQuiz(q, guid); }
			else { me.makeAssessmentQuestion(q); }
		});

		slice.call(doc.querySelectorAll('object[type*=naquestion][data-ntiid]:not([data-used])')).forEach(function(e) {
			e.parentNode.removeChild(e);
		});

		if (!(h instanceof NextThought.model.courseware.UsersCourseAssignmentHistoryItem)) {
			h = h && h.get('history');
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


	setAssignmentFromInstructorProspective: function(assignment, history) {
		this.isInstructorProspective = true;
		this.injectedAssignment = assignment;
		this.injectedAssignmentHistory = history;
	},


	setAssignmentFromStudentProspective: function(assignment, history) {
		this.injectedAssignment = assignment;
		this.injectedAssignmentHistory = history;
	},


	cleanQuestionsThatAreInQuestionSets: function(items, objects) {
		items = items.slice();
		//move assignments to the front.
		items.sort(function(a, b) {
			var c = a.isAssignment,
				d = b.isAssignment;
			return c === d ? 0 : (c && !d) ? -1 : 1;
		});

		var result = [],
			questionsInSets = [],
			push = Array.prototype.push,
			sets = {},
			assignments = [],
			usedQuestions = {};

		function inSet(id) {
			var i = questionsInSets.length - 1;
			for (i; i >= 0; i--) {
				if (id === questionsInSets[i].getId()) {
					return true;
				}
			}
			return false;
		}
		function hasElement(id) {
			var i;
			for (i = 0; i < objects.length; i++) {
				if (objects[i] && typeof objects[i] !== 'string') {
					objects[i] = objects[i].getAttribute('data-ntiid');
				}
				if (objects[i] === id) { return true; }
			}
			return false;
		}

		function pushSetQuestions(i) {
			if (i.isSet) { push.apply(questionsInSets, i.get('questions')); }
		}

		if (this.injectedAssignment) {
			assignments.push(this.injectedAssignment);
		}


		//get sets
		items.forEach(pushSetQuestions);

		items.forEach(function(i) {
			if (i.isAssignment) {
				assignments.push(i);
				i.get('parts').forEach(function(qset) {
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
		assignments.forEach(function(a) {
			(a.get('parts') || []).forEach(function(p) {
				var s = p.get('question_set');
				s = (s && sets[s.getId()]);
				if (s) {
					s.associatedAssignment = a;
				}
			});
		});

		return result;
	}

}, function() {
	var c = NextThought.view.content.reader.ComponentOverlay.prototype;
	Ext.copyTo(this.prototype, c, ['getRelatedElement', 'getContentElement']);
});
