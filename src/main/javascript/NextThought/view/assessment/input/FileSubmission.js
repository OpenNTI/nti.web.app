Ext.define('NextThought.view.assessment.input.FileSubmission', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-filepart',

	inputTpl: Ext.DomHelper.markup({
		tag: 'input',
		type: 'file',
		cls: 'file'
	}),

	renderSelectors: {
		inputField: 'input[type=file]'
	},


	initComponent: function() {
		this.renderData = Ext.apply(this.renderData || {}, {
			tabIndex: this.tabIndexTracker.getNext()
		});

		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.inputField, {
			scope: this,
			change: function(e) {
				var p = this.part,
					t = e.getTarget(),
					allowed = p.isFileAcceptable(t.files[0]);

				this[allowed ? 'reset' : 'markIncorrect']();

				//p.reason;
			}
		});
	},


	getValue: function() {
		return this.inputField.getValue();
	},


	setValue: function() {},


	markCorrect: function() {
		this.callParent(arguments);
		this.inputBox.removeCls('incorrect').addCls('correct');
	},


	markIncorrect: function() {
		this.callParent(arguments);
		this.inputBox.removeCls('correct').addCls('incorrect');
	},


	reset: function() {
		this.callParent(arguments);
		this.inputBox.removeCls(['incorrect', 'correct']);
	}
});
