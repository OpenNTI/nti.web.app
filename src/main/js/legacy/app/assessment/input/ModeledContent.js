const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const DomUtils = require('legacy/util/Dom');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.assessment.input.ModeledContent', {
	extend: 'NextThought.app.assessment.input.Base',
	alias: 'widget.question-input-modeledcontentpart',

	cls: 'modeled-body-part field',

	inputTpl: Ext.DomHelper.markup({
		cls: 'answer-field'
	}),

	SaveProgressBuffer: 5000,

	renderSelectors: {
		inputField: '.answer-field'
	},


	initComponent: function () {
		this.tabIndex = this.tabIndexTracker.getNext();
		this.callParent(arguments);
	},


	afterRender: function () {
		this.editor = Ext.widget('nti-editor', {
			ownerCt: this,
			renderTo: this.inputField,
			onCancel: Ext.emptyFn,
			enableObjectControls: false //lets not open too much complexity yet.
		});

		this.callParent(arguments);

		this.editor.addCls('no-animation');

		this.editor.contentEl.set({tabIndex: this.tabIndex});
		this.editor.activate();

		this.mon(this.editor, {
			'enable-save': 'updateState',
			'no-body-content': function (editor, el) {
				editor.markError(el, getString('NextThought.view.assessment.input.ModeledContent.empty-editor'));
				return false;
			}
		});
	},

	/**
	 * Enable or disable submission accordingly, if we aren't silent save the progress
	 * @param  {Boolean} enable is the editor has something in it
	 * @param  {Boolean} silent if we are setting the value, don't save the progress
	 * @param  {Boolean} forceSubmissionCheck if we want to force checking submission status, thus skipping the early return
	 * @returns {void}
	 */
	updateState: function (enable, silent, forceSubmissionCheck) {
		//Prevent setting enabled/disabled repeatedly.
		enable = enable || undefined;
		if (this.submissionDisabled !== enable && !silent) {
			this.saveProgress();

			if(!forceSubmissionCheck) {
				return;
			}
		}

		if (enable) { this.enableSubmission(silent); }
		else { this.disableSubmission(silent); }
	},


	canHaveAnswerHistory: function () { return false; },


	getValue: function () {
		var v = this.editor.getValue().body;

		if (DomUtils.isEmpty(v)) {
			return null;
		}

		return {
			MimeType: 'application/vnd.nextthought.assessment.modeledcontentresponse',
			value: v
		};
	},


	setValue: function (o) {
		if (o) {
			if (!o.value) {
				console.warn('We did not understand this:', arguments);
			} else {
				this.editor.editBody(o.value, true);
			}
		}
	},


	markCorrect: Ext.emptyFn,
	markIncorrect: Ext.emptyFn,

	setSubmitted () {
		this.callParent(arguments);
		if (!this.getValue()) {
			this.markSubmitted();
		}
	},

	markSubmitted: function () {
		this.editor.lock();
		if (this.isAssignment) {
			this.editor.el.down('.footer').hide();
		}
		this.callParent(arguments);
	},

	instructorReset: function () {
		this.editor.reset(true);
		this.superclass.reset.call(this, arguments);
		this.markSubmitted();
	},

	reset: function () {
		this.editor.reset();
		this.editor.unlock();
		if (this.isAssignment) {
			this.editor.el.down('.footer').show();
		}
		this.callParent(arguments);
	}
});
