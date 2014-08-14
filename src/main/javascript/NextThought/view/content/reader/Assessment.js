Ext.define('NextThought.view.content.reader.Assessment', {
	alias: 'reader.assessment',
	requires: [
		'NextThought.view.assessment.Scoreboard',
		'NextThought.view.assessment.Question',
		'NextThought.view.assessment.QuizSubmission',
		'NextThought.view.assessment.AssignmentFeedback'
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


	makeAssessmentQuiz: function(set) {
		var me = this,
			isInstructor = this.isInstructorProspective,
			h = me.injectedAssignmentHistory,
			o = me.reader.getComponentOverlay(),
			c = o.componentOverlayEl,
			r = me.reader,
			guid = guidGenerator(),
			questions = set.get('questions'),
			submission, pendingAssessment;

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

		submission = o.registerOverlayedPanel(guid + 'submission', Ext.widget('assessment-quiz-submission', {
			reader: r, renderTo: c, questionSet: set,
			tabIndexTracker: o.tabIndexer
		}));

		if (set.associatedAssignment) {
			o.registerOverlayedPanel(guid + 'feedback', Ext.widget('assignment-feedback', {
				reader: r, renderTo: c, questionSet: set,
				tabIndexTracker: o.tabIndexer,
				history: h
			}));
		}

		if (pendingAssessment) {
			submission.setGradingResult(pendingAssessment);
		}
	},


	injectAssessments: function(reader, doc, items) {
		var me = this,
			slice = Array.prototype.slice,
			questionObjs;

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
			if (q.isSet) { me.makeAssessmentQuiz(q); }
			else { me.makeAssessmentQuestion(q); }
		});

		slice.call(doc.querySelectorAll('object[type*=naquestion][data-ntiid]:not([data-used])')).forEach(function(e) {
			e.parentNode.removeChild(e);
		});
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
