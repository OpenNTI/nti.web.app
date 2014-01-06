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
			onCancel: Ext.emptyFn,
			enableObjectControls: false //lets not open too much complexity yet.
		});

		this.callParent(arguments);

		this.editor.addCls('no-animation');

		this.editor.contentEl.set({tabIndex: this.tabIndex});
		this.editor.activate();

		this.mon(this.editor, {
			'enable-save': 'updateState',
			'no-body-content': function(editor, el) {
				editor.markError(el, 'You need to type something');
				return false;
			}
		});
	},


	updateState: function(enable) {
		if (this.submissionDisabled !== enable) {
			return;
		}

		if (enable) { this.enableSubmission(); }
		else { this.disableSubmission(); }
	},


	canHaveAnswerHistory: function() { return false; },


	getValue: function() {
		return {
	        MimeType: 'application/vnd.nextthought.assessment.modeledcontentresponse',
	        value: this.editor.getValue().body
		};
	},


	setValue: function(o) {
		if (!o || !o.value) {
			console.warn('We did not understand this:', arguments);
			return;
		}
		this.editor.editBody(o.value);

		if (this.isAssignment) {
			this.editor.contentEl.set({contentEditable: false});
			this.editor.el.down('.footer').hide();
		}
	},


	markCorrect: Ext.emptyFn,
	markIncorrect: Ext.emptyFn,


	reset: function() {
		this.editor.reset();
		this.callParent(arguments);
	}
});
