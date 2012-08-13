Ext.define('NextThought.view.assessment.input.SingleChoice',{
	extend: 'NextThought.view.assessment.input.MultipleChoice',
	alias: 'widget.question-input-multiplechoicepart',

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData,{
			'choice-style': 'single'
		});
	},

	choiceClicked: function(e){
		var c = e.getTarget('.choice',null,true);
		if(!c){return;}

		this.getEl().select('.choice .control').removeCls('checked');

		c.down('.control').addCls('checked');
	},
	
	getSolutionHtml: function(solution,part) {
		return part.get('choices')[solution.get('value')];
	}
});
