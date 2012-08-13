Ext.define('NextThought.view.assessment.input.MultipleChoice',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-multiplechoicepart',

	inputTpl: Ext.DomHelper.markup({}),

	renderSelectors: {
	},


	initComponent: function(){
		this.callParent(arguments);

		console.log(this.part);
	},


	afterRender: function(){
		this.callParent(arguments);
	}
});
