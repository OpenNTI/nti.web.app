Ext.define('NextThought.view.assessment.input.Matching',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-matchingpart',

	inputTpl: Ext.DomHelper.markup({}),

	renderSelectors: {
	},

	afterRender: function(){
		this.callParent(arguments);
	}
});
