Ext.define('NextThought.view.assessment.input.WordBank', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: [
		'widget.question-input-fillintheblankwithwordbankpart'
	],

	inputTpl: Ext.DomHelper.markup({ cls: 'fill-in', html: '{lineWithBlank}' }),

	beforeRender: function() {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			lineWithBlank: this.part.get('partBody')
		});
	},


	getValue: function() {},


	setValue: function(str) {},


	markCorrect: function() { this.callParent(arguments); },


	markIncorrect: function() { this.callParent(arguments); },


	reset: function() { this.callParent(arguments); }
});
