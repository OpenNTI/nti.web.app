Ext.define('NextThought.view.assessment.input.ModeledContent', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-modeledcontentpart',

	cls: 'modeled-body-part',

	inputTpl: Ext.DomHelper.markup({
		cls: 'answer-field'
	}),

	renderSelectors: {
		inputField: '.answer-field'
	},


	initComponent: function() {
		this.tabIndex = this.tabIndexTracker.getNext();
		this.callParent(arguments);
	},


	afterRender: function() {
		this.editor = Ext.widget('nti-editor', {
			ownerCt: this,
			renderTo: this.inputField,
			onCancel: Ext.emptyFn
		});

		this.callParent(arguments);

		this.editor.addCls('no-animation');

		this.editor.contentEl.set({tabIndex: this.tabIndex});
		this.editor.activate();

		this.mon(this.editor, {
			'enable-save': 'updateState',
			'no-body-content': function(editor, el) {
				editor.markError(el, getString('NextThought.view.assessment.input.ModeledContent.empty-editor'));
				return false;
			}
		});
	},


	updateState: function(enable) {
		//Prevent setting enabled/disabled repeatedly.
		if (this.submissionDisabled !== enable) {
			return;
		}

		if (enable) { this.enableSubmission(); }
		else { this.disableSubmission(); }
	},


	canHaveAnswerHistory: function() { return false; },


	getValue: function() {
		var v = this.editor.getValue().body;

		if (DomUtils.isEmpty(v)) {
			return null;
		}

		return {
	        MimeType: 'application/vnd.nextthought.assessment.modeledcontentresponse',
	        value: v
		};
	},


	setValue: function(o) {
		if (o) {
			if (!o.value) {
				console.warn('We did not understand this:', arguments);
			} else {
				this.editor.editBody(o.value);
			}
		}
	},


	markCorrect: Ext.emptyFn,
	markIncorrect: Ext.emptyFn,

	markSubmitted: function() {
		this.editor.lock();
		if (this.isAssignment) {
			this.editor.el.down('.footer').hide();
		}
		this.callParent(arguments);
	},


	reset: function() {
		this.editor.reset();
		this.editor.unlock();
		if (this.isAssignment) {
			this.editor.el.down('.footer').show();
		}
		this.callParent(arguments);
	}
});
