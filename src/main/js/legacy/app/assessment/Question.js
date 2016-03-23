var Ext = require('extjs');
var ContentUtils = require('../../util/Content');
var OverlayPanel = require('../contentviewer/overlay/Panel');
var MixinsQuestionContent = require('../../mixins/QuestionContent');
var AssessmentHeader = require('./Header');
var AssessmentParts = require('./Parts');
var AssessmentActions = require('./Actions');


module.exports = exports = Ext.define('NextThought.app.assessment.Question', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.assessment-question',

	mixins: {
		questionContent: 'NextThought.mixins.QuestionContent'
	},

	representsUserDataContainer: true,
	cls: 'question scrollable',
	ui: 'assessment',

	items: [
		{xtype: 'box', questionContainer: true}
	],

	dockedItems: [
		{ dock: 'top', xtype: 'question-header'},
		{ dock: 'bottom', xtype: 'question-parts'}
	],

	initComponent: function() {
		this.callParent(arguments);
		var parts = this.question.get('parts'),
				multiPart = (parts.length > 1);

		this.questionContainer = this.down('[questionContainer]');

		this.down('question-parts').setQuestionAndPart(
				this.question,
				this.questionSet,
				this.canSubmitIndividually(),
				this.tabIndexTracker,
				this.retrieveAnswerLabel());

		if (this.questionSet) {
			this.mon(this.questionSet, {
				scope: this,
				'beforesubmit': this.gatherQuestionResponse,
				'beforesaveprogress': this.gatherQuestionProgress,
				'graded': this.updateWithResults,
				'set-progress': this.updateWithProgress,
				'reset': this.reset,
				'reapply-progress': this.reapplyProgress,
				'instructor-reset': this.instructorReset,
				'instructor-show-solutions': this.showInstructorSolutions
			});
		}
		this.mon(this, {
			'enable-submission': this.determineSubmissionState,
			'disable-submission': this.determineSubmissionState
		});

		this.setQuestionContent(multiPart ? null : parts.first());
		this.startTimestamp = new Date().getTime();

		this.AssessmentActions = NextThought.app.assessment.Actions.create();
	},

	getInsertionEl: function() {
		var l = this.getLayout();
		return (l && l.innerCt) || this.body;
	},

	findLine: function() {
		var ce = this.contentElement,
			doc = ce && ce.ownerDocument,
			range = doc && doc.createRange();

		if (range) {
			range.selectNodeContents(this.contentElement);
		}
		return {range: range, rect: this.el.dom.getBoundingClientRect()};
	},

	setupContentElement: function() {
		this.callParent(arguments);
		this.removeContent('.naqsolutions,.naqchoices,.rightwrongbox');
	},

	retrieveAnswerLabel: function() {
		var sln = this.contentElement && Ext.get(this.contentElement).select('.naqsolution'),
			firstSln = !Ext.isEmpty(sln) ? sln.elements.first() : null,
			firstUnits;

		// TODO: move this logic into the part that cares. (the question part!) ...OH and don't get it form
		// the solution content that we're going to take away. :/ (this will return an empty label until we
		// rework this.)
		firstUnits = firstSln ? firstSln.getAttribute('data-nti-units') : null;

		if (firstUnits) {
			firstUnits = firstUnits.split(',');
			firstUnits = firstUnits.first();
		}
		return firstUnits;
	},

	determineSubmissionState: function() {
		var d = this.query('[submissionDisabled=true]'),
				multi = this.down('assessment-multipart-submission');
		this.submissionDisabled = (d.length !== 0);

		if (multi) {
			multi[this.submissionDisabled ? 'disableSubmission' : 'enableSubmission']();
		}
	},

	reapplyProgress: function(questionSetSubmission) {
		this.updateWithProgress(questionSetSubmission, null, true);
	},

	/**
	 * Takes a question set submission and updates the inputs with those values, without triggering
	 * it to be marked correct or incorrect
	 * @param  {QuestionSetSubmission} questionSetSubmission the users last values they had
	 */
	updateWithProgress: function(questionSetSubmission, eopts, reapplying) {
		if (!questionSetSubmission) { return; }

		var q, id = this.question.getId(),
			questions = questionSetSubmission.get('questions') || [];

		if (questionSetSubmission.isSet) {
			questions.every(function(question) {
				if (question.getId() === id || question.get('questionId') === id) {
					q = question;
				}

				return !q;
			});
		} else {
			q = questionSetSubmission;
		}

		this.down('question-parts').updateWithProgress(q, reapplying);
	},

	updateWithResults: function(assessedQuestionSet) {
		var q, id = this.question.getId(),
			correct,
			fn = {
				'null': 'markSubmitted',
				'true': 'markCorrect',
				'false': 'markIncorrect'
			};

		if (assessedQuestionSet && assessedQuestionSet.isSet) {
			Ext.each(assessedQuestionSet.get('questions'), function(i) {
				if (i.getId() === id || i.get('questionId') === id || i.get('pollId') === id) {
					q = i;
					return false;
				}
			});
		}
		else {
			q = assessedQuestionSet;
		}

		if (!q) {
			this.addCls('no-data');
		}

		correct = q && String(q.isCorrect());
		if (!fn[correct]) {
			correct = 'null';
		}
		this[fn[correct]](assessedQuestionSet && assessedQuestionSet.noMark);

		this.down('question-parts').updateWithResults(q);
	},

	gatherQuestionProgress: function(questionSet, collection) {
		var id = this.question.getId(), values = [];

		Ext.each(this.query('abstract-question-input'), function(p) {
			var v = p.getProgress ? p.getProgress() : p.getValue();

			if (v === undefined || v === null) {
				v = null;
			}

			values[p.getOrdinal()] = v;
		});

		if (collection.hasOwnProperty(id)) {
			console.error('duplicate id in submission!', id);
			return false;
		}

		collection[id] = values;
	},

	gatherQuestionResponse: function(questionSet, collection) {
		var id = this.question.getId(), values = [];
		Ext.each(this.query('abstract-question-input'), function(p) {
			var v = p.getValue();
			if (v === undefined || v === null) {
				console.warn('Question has not been answered yet');
				v = null;
			}
			p.setSubmitted();
			values[p.getOrdinal()] = v;
		});

		if (collection.hasOwnProperty(id)) {
			console.error('duplicate id in submission!', id);
			return false;
		}

		collection[id] = values;
	},

	canSubmitIndividually: function() {
		var c = this.contentElement;

		function resolve() {
			var el = Ext.get(c).down('param[name=canindividual]');
			return !el || el.getValue() !== 'false';
		}

		//don't dig into the dom if we already have an answer
		if (this.questionSet) {
			return false;
		}

		return !c || resolve();
	},

	setQuestionContent: function(part) {
		var me = this,
			root = me.reader.getLocation().root, c, p;

		c = this.question.get('content') || '';
		p = part ? part.get('content') : '';

		//don't append a break unless there is actual content
		if (c.replace(/<[^>]*?>|\s+/g, '')) {
			c += '<br/>';
		}

		this.questionContainer.update(
			Ext.DomHelper.markup({
				 cls: 'question-content',
				 html: this.buildContent(ContentUtils.fixReferences(c + p, root))
			 }));

		function santatize() {
			me.el.select('a[href]').set({target: '_blank'});
			me.el.select('a:empty').set({
				id: null,
				name: null
			});
			me.updateLayout();
		}

		if (!this.rendered) {
			me.on('afterrender', santatize);
		} else {
			santatize();
		}
	},

	afterRender: function() {
		this.callParent(arguments);
		this.getTargetEl().select('img').on('load', function() {
			this.updateLayout();
			this.syncElementHeight();
		}, this, {single: true});
		this.getTargetEl().addCls('indexed-content');
		this.syncTop();
	},

	markCorrect: function(noMark) {
		if (!noMark) {
			this.down('question-header').markCorrect();
		}

		this.markSubmitted();
	},

	markIncorrect: function(noMark) {
		if (!noMark) {
			this.down('question-header').markIncorrect();
		}

		this.markSubmitted();
	},

	markSubmitted: function() {
		var sub = this.down('assessment-multipart-submission');
		if (sub) {
			sub.disableSubmission();
		}

		this.submitted = true;
		this.addCls('submitted');
	},

	reset: function(keepAnswers) {
		this.down('question-header').reset();
		this.down('question-parts').reset(keepAnswers);
		delete this.submitted;
		this.removeCls('submitted no-data');
		this.determineSubmissionState();
	},

	instructorReset: function() {
		this.down('question-header').reset();
		this.down('question-parts').instructorReset();
	},

	showInstructorSolutions: function() {
		this.down('question-parts').showQuestionSetWithAnswers();
	},

	checkIt: function() {
		if (this.submissionDisabled) {
			return;
		}

		if (this.submitted) {
			this.reset(true);
			return;
		}

		this.submitted = true;

		var me = this,
			coll = {};

		me.gatherQuestionResponse(null, coll);


		me.mask('Grading...');

		me.AssessmentActions.checkAnswer(me.question, coll[me.question.getId()], me.startTimestamp, me.canSubmitIndividually())
			.then(function(result) {
				me.updateWithResults(result);
			})
			.fail(function() {
				alert('There was a problem grading your question.');
			})
			.always(function() {
				me.unmask();
			});
	}
});
