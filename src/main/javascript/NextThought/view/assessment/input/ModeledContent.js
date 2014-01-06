Ext.define('NextThought.view.assessment.input.ModeledContent', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-modeledcontentpart',

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
			enableObjectControls: false //lets not open too much complexity yet.
		});

		this.callParent(arguments);

		this.editor.contentEl.set({tabIndex: this.tabIndex});
		this.editor.activate();

		this.mon(this.editor, {
			'activated-editor': function() {},
			'deactivated-editor': function() {},
			'no-body-content': function(editor, el) {
				editor.markError(el, 'You need to type something');
				return false;
			}
		});
	},


	canHaveAnswerHistory: function() { return false; },


	getValue: function() { return this.editor.getValue(); },


	setValue: function(str) {
		this.editor[typeof str === 'string' ? 'setValue' : 'editBody'](str);
	},


	markCorrect: function() {
		this.callParent(arguments);
	},


	markIncorrect: function() {
		this.callParent(arguments);
	},


	reset: function() {
		this.editor.reset();
		this.callParent(arguments);
	}
});
