export default Ext.define('NextThought.app.assessment.input.Base', {
	extend: 'Ext.Component',
	alias: 'widget.abstract-question-input',

	requires: [
		'NextThought.common.menus.AnswerHistory'
	],

	cls: 'field',

	SaveProgresBuffer: 1000,

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'response-container',
			cn: [
				{ cls: 'inputbox', html: '{input}' },
				{ cls: 'historyMenu x-menu' },
				{ cls: 'solution', cn: [
					{ cls: 'close' },
					{ cls: 'answer', cn: [{tag: 'span'}] },
					{ cls: 'explanation'}
				] }
			]
		},{
			cls: 'footer',
			cn: [{
					 cls: 'left', html: '{toolbar}'
				 },{
					 cls: 'right',
					 cn: [
						 {cls: 'action check'},
						 {cls: 'action solution', html: '{{{NextThought.view.assessment.input.Base.show-solution}}}'},
						 {cls: 'action results', html: 'View Results'},
					 	 {cls: 'action report', html: 'View Report'}
					 ]
				 }]
		}
	]),


	renderSelectors: {
		inputBox: '.response-container .inputbox',
		historyMenuEl: '.response-container .historyMenu',
		solutionBox: '.response-container .solution',
		solutionClose: '.response-container .solution .close',
		solutionAnswerBox: '.response-container .solution .answer span',
		solutionExplanationBox: '.response-container .solution .explanation',
		showSolutionBtn: '.footer .action.solution',
		checkItBtn: '.footer .action.check',
		reportBtn: '.footer .action.report',
		resultsBtn: '.footer .action.results',
		footer: '.footer'
	},


	onClassExtended: function(cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {},cls.superclass.renderSelectors);

		data.inputTpl = data.inputTpl || cls.superclass.inputTpl || false;
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		//merge in subclass's input template
		var tpl = this.prototype.renderTpl
				.replace('{input}', data.inputTpl || '')
				.replace('{toolbar}', data.toolbarTpl || '');

		if (!data.renderTpl) {
			data.renderTpl = tpl;
		}
		else {
			data.renderTpl = data.renderTpl.replace('{super}', tpl);
		}
	},


	filterHTML: function(html) {
		var root = this.reader.getLocation().root;
		function fixRef(original, attr, url) {
			return (/^data:/i.test(url) || Globals.HOST_PREFIX_PATTERN.test(url)) ? original : attr + '="' + root + url + '"';
		}

		if (!html || !html.replace) {
			return html;
		}

		return html.replace(/<\/?(html|head|meta|title|link|body|a|p)((( |\t)[^>]*)?)>/ig, '')
				.replace(/^\s+/, '')
				.replace(/\s+$/, '')
				.replace(/(src)="(.*?)"/igm, fixRef);
	},


	getSolutionContent: function(part) {
		var solutions = [];
		Ext.each(part.get('solutions'), function(s) {
			solutions.push(s.get('value'));
		});

		return this.filterHTML(solutions.join(''));
	},


	initComponent: function() {
		this.callParent(arguments);

		this.hideSolutionLabel = getString('NextThought.view.assessment.input.Base.hide-solution');
		this.showSolutionLabel = getString('NextThought.view.assessment.input.Base.show-solution');
		this.hideHintLabel = getString('NextThought.view.assessment.input.Base.hide-hint');
		this.showHintLabel = getString('NextThought.view.assessment.input.Base.show-hint');

		this.isAssignment = Boolean(this.questionSet && this.questionSet.associatedAssignment);

		this.saveProgress = Ext.Function.createBuffered(this.saveProgress, this.SaveProgressBuffer);

		if (this.isAssignment) {
			this.noMark = Boolean(this.questionSet.noMark);
		}

		this.addEvents({
			'enable-submission': true,
			'disable-submission': true
		});
		this.enableBubble(['enable-submission', 'disable-submission']);
	},

	/*
		getBubbleTarget: function(){
			return this.up('assessment-question');
		},
	  */

	getContentElement: function() {
		var ct = this.up('[contentElement]');
		//if this returns null, it SHOULD blow up. Programmer error.

		ct = ct.contentElement.querySelectorAll('.naquestionpart')[this.ordinal];
		if (!ct) {
			Ext.Error.raise('Part Content Missing');
		}

		return ct;
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.showSolutionBtn, {
			scope: this,
			click: this.toggleSolution
		});

		this.mon(this.checkItBtn, {
			scope: this,
			click: this.checkit
		});

		this.mon(this.solutionClose, {
			scope: this,
			click: this.hideSolution
		});

		this.mon(this.inputBox, {
			scope: this,
			click: this.editAnswer
		});

		this.mon(this.reportBtn, {
			scope: this,
			click: this.showReport.bind(this)
		});

		this.mon(this.resultsBtn, {
			scope: this,
			click: this.showResults.bind(this)
		});

		this.showSolutionBtn.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.checkItBtn.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.resultsBtn.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.reportBtn.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.solutionAnswerBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.inputBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.solutionBox.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.footer.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.historyMenuEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		//if there are images, after they load, update layout.
		this.solutionBox.select('img').on('load', function() {
			this.updateLayout();
			this.syncElementHeight();
		},this, {single: true});

		this.reset();

		wait()
			.then(this.disableSubmission.bind(this, true));

		if (this.canHaveAnswerHistory()) {
			this.mon(this.historyMenuEl, {
				scope: this,
				click: this.showHistoryMenu
			});

		}
		else {
			this.historyMenuEl.remove();
		}

		if (this.questionSet) {
			this.questionSet.setProgress(this.question, this);
		}


		this.maybeShowReport();
		this.maybeShowResults();
	},


	maybeShowReport: function() {
		var questionLink = this.question && this.question.getReportLink && this.question.getReportLink(),
			setLink = this.questionSet && this.questionSet.getReportLink && this.questionSet.getReportLink();

		if (questionLink && !setLink) {
			this.reportBtn.show();
		} else {
			this.reportBtn.hide();
		}
	},


	maybeShowResults: function() {
		var questionLink = this.question && this.question.getResultsLink && this.question.getResultsLink(),
			setLink = this.questionSet && this.questionSet.getResultsLink && this.questionSet.getResultsLink();

		if (questionLink && !setLink) {
			this.resultsBtn.show();
		} else {
			this.resultsBtn.hide();
		}
	},


	syncElementHeight: function() {
		var o = this.up('[syncElementHeight]');
		if (o) {o.syncElementHeight();}
	},


	checkit: function() {
		if (this.submissionDisabled) {return;}
		if (this.submitted) {
			this.editAnswer();
			return;
		}

		this.setSubmitted();
		this.up('assessment-question').checkIt();
	},

	editAnswer: function() {
		var ans;
		if (this.submitted && !this.isAssignment && !this.reponseBoxMasked) {
			ans = this.getValue();

			if (this.questionSet) {
				this.questionSet.fireEvent('reset');
			} else {
				this.up('assessment-question').reset(true);
			}

			this.setValue(ans);
			this.focus();
			this.enableSubmission();
		}
	},


	setSubmitted: function() {
		var question = this.up('assessment-question');

		this.submitted = true;
		if (question.SubmittedTextOverride === false) {
			this.checkItBtn.hide();
		} else {
			this.checkItBtn.update(question.SubmittedTextOverride || 'Try again');
		}
	},


	getOrdinal: function() {
		if (!Ext.isNumber(this.ordinal)) {
			Ext.Error.raise('The question part\'s ordinal was not set or incorrectly set.');
		}
		return this.ordinal;
	},


	hasValue: function() { return !Ext.isEmpty(this.getValue()); },

	//return a number between [0, 1] to indicate what % of this question is answered
	getAnsweredCount: function() {
		return this.hasValue() ? 1 : 0;
	},


	getValue: function() {
		console.log(this.$className + ' does not implement the getValue function');
	},


	setValue: function() {
		console.log(this.$className + ' does not implement the setValue function');
	},


	showReport: function() {
		var win = Ext.widget('iframe-window', {
				width: 'max',
				saveText: getString('NextThought.view.menus.Reports.savetext'),
				link: this.question.getReportLink(),
				loadingText: getString('NextThought.view.menus.Reports.loadingtext')
			});

		win.show();
	},


	showResults: function() {
		var question = this.up('assessment-question');

		question.showResults();
	},


	updateSolutionButton: function() {
		var p = this.part,
			a = this.solutionAnswerBox,
			b = this.showSolutionBtn,
			e = this.solutionExplanationBox,
			sol, shown = this.inputBox && !this.inputBox.isVisible(),
			answer = this.el.down('.answer');

		function removeObjects(dom) {
			var el = document.createElement('div');

			el.id = 'tempdom';
			el.innerHTML = dom;

			new Ext.dom.CompositeElementLite(el.querySelectorAll('object')).remove();

			return el.innerHTML;
		}

		answer.setVisibilityMode(Ext.dom.Element.DISPLAY);

		b.update(
				this.hintActive ?
					(shown ? this.hideHintLabel : this.showHintLabel) :
					(shown ? this.hideSolutionLabel : this.showSolutionLabel)
		);

		if (this.hintActive) {
			answer.hide();
			e.update(this.filterHTML(p.get('hints')[this.currentHint || 0].get('value')));
		}
		//if we are submitted or if we are in an assignment and have solutions
		else if (this.submitted || (this.questionSet && this.questionSet.isAssignment && p.hasSolutions())) {
			answer.show();
			sol = this.getSolutionContent(p);
			if (!Ext.isString(sol)) {
				sol += '';
			}

			sol = removeObjects(sol);
			a.update(sol);
			e.update(this.filterHTML(p.get('explanation')));
		}
		else {
			a.update('');
			e.update('');
		}

		if (e.getHTML() === '' && a.getHTML() === '') { b.hide(); } else { b.show(); }
	},


	submitOrTabNext: function(dom) {
		var i, x, next, nextTabIndex = String(parseInt(dom.getAttribute('tabIndex'), 10) + 1),
			partLen = this.question.get('parts').length;
		if (this.questionSet || (partLen > 1 && (partLen - 1) !== this.ordinal)) {
			i = this.el.up('.component-overlay').query('.tabable');
			x = i.length - 1;
			for (x; x >= 0; x--) {
				if (i[x].getAttribute('tabIndex') === nextTabIndex) {
					next = i[x];
					break;
				}
			}
			if (!next) {
				x = i.length - 1;
				for (x; x >= 0; x--) {
					if (i[x] === dom) {
						next = i[x + 1] || i[0];
						break;
					}
				}
			}
			next.focus();
		}
		else {
			this.checkit();
		}
	},

	shouldShowAnswerHistory: function() {
		var id = this.up('[question]').question.getId();
		if (!id) { return false; }

		this.loadAnswerHistory(id);
	},

	canHaveAnswerHistory: function() {
		/**
		 *  Overridable function to determine whether or not we should have history.
		 *  The default is no.
		 */

		return false;
	},

	setupAnswerHistoryMenu: function() {
		var me = this,
			id = me.up('[question]').question.getId();
		if (!me.answerHistStore) {
			me.answerHistStore = me.buildAnswerHistoryStore(id);
		}
		me.historyMenu = Ext.widget('answer-history-menu', {
			width: me.inputBox.getWidth(),
			ownerCmp: me,
			store: me.answerHistStore,
			renderedData: {
				'partNum': me.ordinal,
				menuItemType: me.getPreviousMenuItemType()
			}
		});
	},

	getPreviousMenuItemType: function() {
		return 'menuitem';
	},

	showHistoryMenu: function(e) {
		var me = this,
			vH = Ext.dom.Element.getViewportHeight(),
			box = me.inputBox.getBox(),
			maxHeight = vH - box.bottom,
			anchor = 'tl-bl';

		if (maxHeight <= 150) {
			maxHeight = box.y;
			anchor = 'bl-tl?';
		}

		if (me.historyMenu && me.historyMenu.isVisible()) {
			me.historyMenu.destroy();
			return;
		}
		me.setupAnswerHistoryMenu();
		me.historyMenu.maxHeight = maxHeight;

		//		console.log('Viewport height: ', vH,', anchor: ', anchor, ' maxHeight: ', maxHeight, ' box top: ', box.y);
		me.historyMenu.showBy(me.inputBox, anchor, [0, 0]);
		me.answerHistStore.reload();
	},

	buildAnswerHistoryStore: function(id) {
		var s = NextThought.store.PageItem.create({containerid: id}),
			params = 'application/vnd.nextthought.assessment.assessedquestion', url, root, me = this;

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {},{
			sortOn: 'createdTime',
			accept: params,
			sortOrder: 'descending'
		});

		//TODO: this smells funny. Fix.
		root = 'tag%3Anextthought.com%2C2011-10%3ARoot';
		url = s.proxy.url;
		s.proxy.url = url.replace(root, encodeURIComponent(id));

		this.answerHistStore = s;
		return s;
	},

	//set the inputs values with out marking it correct or incorrect
	updateWithProgress: function(questionSubmission) {
		var parts = (questionSubmission && questionSubmission.get('parts')) || {},
			part = parts[this.ordinal];

		if (this.setProgress) {
			this.setProgress(part);
		} else {
			this.setValue(part);
		}

		if (part !== null) {
			this.enableSubmission(true);
		}

		this.questionSet.setProgress(this.question, this);
	},


	updateWithResults: function(assessedQuestion) {
		var parts = (assessedQuestion && assessedQuestion.get('parts')) || {},
			part = parts[this.ordinal], id, correct,
			fn = {
				'null': 'markSubmitted',
				'true': 'markCorrect',
				'false': 'markIncorrect'
			};

		if (part && part.get) {
			this.part.set({
				explanation: part.get('explanation') || this.part.get('explanation'),
				solutions: part.get('solutions') || this.part.get('solutions')
			});
		}

		this.setValue(part && part.get ? part.get('submittedResponse') : part);

		this.setSubmitted();

		correct = part && part.isModel ? String(part.isCorrect()) : null;
		if (!fn[correct] || this.noMark) {
			correct = 'null';
		}

		this[fn[correct]]();

		if (this.canHaveAnswerHistory()) {
			if (this.historyMenuEl && !this.historyMenuEl.isVisible()) {
				this.shouldShowAnswerHistory();
			}
			if (!this.answerHistStore) {
				id = this.up('[question]').question.getId();
				this.buildAnswerHistoryStore(id);
			}
			this.answerHistStore.fireEvent('changed');
		}
	},


	markSubmitted: function(cls) {
		var o = this.up('question-parts').removeCls('incorrect correct').addCls('submitted');
		if (!Ext.isEmpty(cls)) {o.addCls(cls);}
		this.hintActive = false;
		this.hideSolution();
		this.updateSolutionButton(true);
	},


	markCorrect: function() {
		this.markSubmitted('correct');
		this.checkItBtn.hide();
		this.checkItBtn.removeCls('wrong');
		this.updateLayout();
	},


	markIncorrect: function() {
		this.markSubmitted('incorrect');
		this.checkItBtn.addCls('wrong');
	},


	reset: function() {
		var question = this.up('assessment-question');

		this.submitted = false;
		this.up('question-parts').removeCls('correct incorrect submitted');
		this.hintActive = (this.part.get('hints').length > 0);
		this.currentHint = 0;
		this.updateSolutionButton();
		this.checkItBtn.show();
		this.footer.show();
		this.checkItBtn.removeCls('wrong').update(question.NotSubmittedTextOverride || getString('NextThought.view.assessment.input.Base.check'));
		this.hideSolution();
		this.disableSubmission(true);
		this.updateLayout();
	},


	maskResponseBox: function() {
		this.reponseBoxMasked = true;
		this.inputBox.mask();
	},


	instructorReset: function() {
		this.reset();

		this.setSubmitted();
	},


	saveProgress: function() {
		if (this.questionSet) {
			this.questionSet.saveProgress(this.question, this);
		}
	},


	enableSubmission: function(fromReset) {
		if (!this.rendered) {
			this.on('afterrender', this.enableSubmission.bind(this, fromReset));
			return;
		}

		if (this.isAssignment && this.submitted) {
			return;
		}

		if (!fromReset) {
			delete this.submissionDisabled;
		} else {
			console.log('enabling submission from a reset');
		}

		this.checkItBtn.removeCls('disabled');
		if (this.questionSet) {
			if (!this.questionSet.fireEvent('answered', this.question, this.part, this.getAnsweredCount(), true)) {
				this.submissionDisabled = true;
			}
		}
		this.fireEvent('enable-submission', this.ordinal);

		if (!fromReset) {
			this.saveProgress();
		}
	},


	disableSubmission: function(doNotSave) {
		if (!this.rendered) {
			this.on('afterrender', this.disableSubmission.bind(this, doNotSave));
			return;
		}

		this.submissionDisabled = true;
		this.checkItBtn.addCls('disabled');
		if (this.questionSet) {
			this.questionSet.fireEvent('answered', this.question, this.part, this.getAnsweredCount(), false);
		}
		this.fireEvent('disable-submission', this.ordinal);

		//Some question fill call this when they are emptied so we want to save progress
		//but this is also called on reset and afterrender, and we don't want to save progress then
		if (!doNotSave) {
			this.saveProgress();
		}
	},


	toggleSolution: function() {
		var annotations = this.reader.getAnnotations();

		if (annotations) {
			annotations.realignAnnotations();
		}

		if (this.solutionBox && this.solutionBox.isVisible()) {
			this.hideSolution();
		}
		else {
			this.showSolution();
		}
	},


	hideSolution: function() {
		this.showSolutionBtn.update(this.hintActive ? this.showHintLabel : this.showSolutionLabel);
		this.solutionBox.hide();
		this.inputBox.show();
		this.updateLayout();
		if (this.canHaveAnswerHistory()) { this.historyMenuEl.show(); }

		wait()
			.then(this.updateLayout.bind(this));
	},


	showSolution: function() {
		this.updateSolutionButton();
		this.currentHint = ((this.currentHint + 1) % (this.part.get('hints').length || 1));

		//if there are images, after they load, update layout.
		this.solutionBox.select('img').on('load', function() {
			this.updateLayout();
			this.syncElementHeight();
		},this, {single: true});

		this.showSolutionBtn.update(this.hintActive ? this.hideHintLabel : this.hideSolutionLabel);
		this.inputBox.hide();
		this.solutionBox.show();
		this.updateLayout();
		if (this.canHaveAnswerHistory()) { this.historyMenuEl.hide(); }
	}
});
