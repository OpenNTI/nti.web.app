Ext.define('NextThought.view.assessment.input.WordBank', {
	extend: 'NextThought.view.assessment.input.Base',
	alias: [
		'widget.question-input-fillintheblankwithwordbankpart'
	],

	cls: 'wordbank-input',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'wordbank-ct' },
		'{super}'
	]),


	inputTpl: Ext.DomHelper.markup({ cls: 'fill-in', html: '{lineWithBlank}' }),


	blankTpl: Ext.DomHelper.createTemplate({ tag: 'span', cls: 'blank drop target', html: '&nbsp;' }),


	renderSelectors: {
		wordBankEl: '.wordbank-ct'
	},


	beforeRender: function() {
		this.callParent(arguments);
		Ext.apply(this.renderData, {
			lineWithBlank: this.part.get('input')
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		var blanks,
			wordbank = this.part.get('wordbank');
		if (wordbank) {
			this.wordbank = Ext.widget({xtype: 'assessment-components-wordbank', record: this.part, renderTo: this.wordBankEl});
		}

		blanks = this.inputBox.query('input.nqablankfield');//TODO: input[type="blank"]

		blanks.forEach(this.setupBlank.bind(this));
	},


	setupBlank: function(input) {
		this.blankTpl.insertAfter(input, input.dataset);
	},


	getValue: function() {},


	setValue: function(str) {},


	markCorrect: function() { this.callParent(arguments); },


	markIncorrect: function() { this.callParent(arguments); },


	reset: function() { this.callParent(arguments); }
});
