const Ext = require('extjs');
require('./PartContent');
require('./MultiPartSubmission');
require('./input/Base');
require('./input/FileSubmission');
require('./input/FreeResponse');
require('./input/Matching');
require('./input/ModeledContent');
require('./input/MultipleChoice');
require('./input/NumericMath');
require('./input/Ordering');
require('./input/Short');
require('./input/SingleChoice');
require('./input/SymbolicMath');
require('./input/Unsupported');
require('./input/WordBank');


module.exports = exports = Ext.define('NextThought.app.assessment.Parts', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.question-parts',
	plain: true,
	cls: 'parts',
	ui: 'assessment',

	setQuestionAndPart: function (question, questionSet, individual, tabIndexTracker, answerLabel) {
		var parts = question.get('parts'),
			multiPart = (parts.length > 1);

		this.removeAll(true);

		this[individual ? 'removeCls' : 'addCls']('part-of-set');

		if (multiPart) {
			this.setMultiPart(question, questionSet, parts, tabIndexTracker, answerLabel);
			if (individual) {
				this.add(
					{
						xtype: 'assessment-multipart-submission',
						question: question,
						tabIndexTracker: tabIndexTracker
					}
				);
			}
			return;
		}

		this.setSinglePart(question, questionSet, parts.first(), tabIndexTracker, answerLabel);
	},

	setSinglePart: function (question, questionSet, part, tabIndexTracker, answerLabel) {
		var cls = (part && part.get) ? part.get('Class') : 'unsupported',
			type = 'question-input-' + cls.toLowerCase();

		//Set the answerLabel on the model.
		if (answerLabel) {
			part.set('answerLabel', answerLabel);
		}
		//	console.log('set answer label to: ', answerLabel);

		try {
			this.add({
					reader: this.up('[reader]').reader,
					xtype: type,
					question: question,
					part: part,
					ordinal: 0,
					questionSet: questionSet,
					tabIndexTracker: tabIndexTracker
				});
		}
		catch (e) {
			console.warn('missing question type: ' + type, '\n\tUnderlying Error: ', (e.stack || e.message || e));
		}
	},

	setMultiPart: function (question, questionSet, parts, tabIndexTracker, answerLabel) {
		var type, part, items, i;

		this.addCls('multipart');

		for (i = 0; i < parts.length; i++) {
			part = parts[i];

			if (answerLabel) {
				part.set('answerLabel', answerLabel);
			}

			items = [];
			type = 'question-input-' + part.get('Class').toLowerCase();
			items.push({xtype: 'part-content', question: question, part: part, ordinal: i, reader: this.up('[reader]').reader});
			items.push({
						 xtype: type,
						 reader: this.up('[reader]').reader,
						 question: question,
						 part: part,
						 ordinal: i,
						 questionSet: questionSet,
						 tabIndexTracker: tabIndexTracker
					 });

			try {
				this.add({
						xtype: 'container',
						layout: 'auto',
						cls: 'part-container',
						items: items
					});
			}
			catch (e) {
				console.warn('missing question type: ' + type, '\n\tUnderlying Error: ', (e.stack || e.message || e));
			}
		}
	},

	updateWithProgress: function (questionSubmission, reapplying) {
		var parts = this.query('[updateWithProgress]');
		Ext.each(parts, function (part) {
			part.updateWithProgress(questionSubmission, reapplying);
		});
	},

	updateWithResults: function (assessedQuestion) {
		var parts = this.query('[updateWithResults]');
		Ext.each(parts, function (part) {part.updateWithResults(assessedQuestion);});
	},

	reset: function (keepAnswers) {
		//debugger;
		var inputs = this.query('abstract-question-input,assessment-multipart-submission');
		Ext.each(inputs, function (input) {
			var val, dontUseTheOldAnswer;
			if (keepAnswers && input.getValue) {
				val = input.getValue();
			}

			dontUseTheOldAnswer = input.reset(keepAnswers);

			if (!dontUseTheOldAnswer && keepAnswers && input.setValue) {
				input.setValue(val);
			}
			if (input.enableSubmission) {
				input.enableSubmission(true);
			}
		});
	},

	instructorReset: function () {
		//debugger;
		var inputs = this.query('abstract-question-input,assessment-multipart-submission');

		Ext.each(inputs, function (input) {
			//debugger;
			input.instructorReset();
		});
	},

	showQuestionSetWithAnswers: function () {
		var parts = this.query('[markSubmitted]');
		Ext.each(parts, function (part) {
			part.maskResponseBox();
			part.setSubmitted();
			part.markSubmitted();
		});
	},

	afterRender: function () {
		this.callParent(arguments);
		var me = this;
		//updatelayout because sometimes this can render before other things, causing overlap
		setTimeout(function () {me.updateLayout();}, 500);
	}
});
