Ext.define('NextThought.view.assessment.Question', {
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.assessment-question',

	requires: [
		'NextThought.view.assessment.Header',
		'NextThought.view.assessment.Parts'
	],


	mixins: {
		questionContent: 'NextThought.mixins.QuestionContent'
	},


	representsUserDataContainer: true,

	cls: 'question scrollable',
	ui: 'assessment',

	dockedItems: [
		{ dock: 'top', xtype: 'question-header'},
		{ dock: 'bottom', xtype: 'question-parts'}
	],


	initComponent: function() {
		this.callParent(arguments);
		var parts = this.question.get('parts'),
				multiPart = (parts.length > 1);

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
				'graded': this.updateWithResults,
				'reset': this.reset
			});
		}
		this.mon(this, {
			'enable-submission': this.determineSubmissionState,
			'disable-submission': this.determineSubmissionState
		});

		this.setQuestionContent(multiPart ? null : parts.first());
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


	updateWithResults: function(assessedQuestionSet) {
		var q, id = this.question.getId(),
			correct,
			fn = {
				'null': 'markSubmitted',
				'true': 'markCorrect',
				'false': 'markIncorrect'
			};

		if (assessedQuestionSet.isSet) {
			Ext.each(assessedQuestionSet.get('questions'), function(i) {
				if (i.getId() === id || i.get('questionId') === id) {
					q = i;
					return false;
				}
			});
		}
		else {
			q = assessedQuestionSet;
		}


		correct = q && String(q.isCorrect());
		if (!fn[correct]) {
			correct = 'null';
		}
		this[fn[correct]](assessedQuestionSet.noMark);

		if (q) {
			this.down('question-parts').updateWithResults(q);
		}
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
			root = ContentUtils.getRoot(this.reader.getLocation().NTIID), c, p;

		c = this.question.get('content') || '';
		p = part ? part.get('content') : '';

		//don't append a break unless there is actual content
		if (c.replace(/<[^>]*?>|\s+/g, '')) {
			c += '<br/>';
		}

		this.update(
			Ext.DomHelper.markup({
				 cls: 'question-content',
				 html: this.buildContent(ContentUtils.fixReferences(c + p, root))
			 }));

		function santatize() {
			me.el.select('a[href]').set({target: '_blank'});
			me.el.select('a:empty').remove();
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
		var head = this.down('question-header'),
			sub = this.down('assessment-multipart-submission');
		if (sub) {
			sub.disableSubmission();
		}

		/*if (!head.isVisible()) {
			head.markSubmitted();
		}*/

		this.submitted = true;
		this.addCls('submitted');
	},


	reset: function(keepAnswers) {
		this.down('question-header').reset();
		this.down('question-parts').reset(keepAnswers);
		delete this.submitted;
		this.removeCls('submitted');
		this.determineSubmissionState();
		//	var sub = this.down('assessment-multipart-submission');
		//	if (sub){sub.enableSubmission();}
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
		var coll = {};
		this.gatherQuestionResponse(null, coll);
		this.fireEvent('check-answer', this, this.question, coll[this.question.getId()]);
	}
});
