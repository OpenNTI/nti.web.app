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
		if(this.submitted){return;}

		var c = e.getTarget('.choice',null,true);
		if(!c){return;}

		this.getEl().select('.choice .control').removeCls('checked');

		c.down('.control').addCls('checked');
		this.enableSubmission();
	},


	getValue: function(){
		var r = this.callParent();
		return r[0];
	}
});
