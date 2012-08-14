Ext.define('NextThought.view.assessment.input.MultipleChoice',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-waitingforName',

	inputTpl: Ext.DomHelper.markup({ cls: 'multi-choice {choice-style}', cn:[{
		tag: 'tpl', 'for': 'choices', cn: [{
			cls: 'choice',
			cn:[
				{ tag: 'span', cls: 'control', 'data-index':'{[xindex-1]}'},//xindex is 1 based
				{ tag: 'span', cls: 'label', html:'{[String.fromCharCode(64+xindex)]}.' },
				{ tag: 'span', html:'{.}'  }
			]
		}]}
	]}),


	solTpl: Ext.DomHelper.createTemplate({
		cls: 'multiple-choice-solution',
		cn: ['{0}. ',{tag: 'span', cls: 'solution-choice-text', html:'{1}'}]
	}).compile(),


	initComponent: function(){
		this.callParent(arguments);
		this.choices = (this.part.get('choices')||[]).slice();

		//clean out markup
		Ext.each(this.choices,function(v,i,a){
			a[i] = v.replace(/<.*?>/g, '').replace(/^\s+/,'').replace(/\s+$/,'');
		});

		this.renderData = Ext.apply(this.renderData||{},{
			choices: this.choices,
			'choice-style': 'multi'
		});
	},


	afterRender: function(){
		this.solutionAnswerBox = this.solutionAnswerBox.up('.answer');

		this.callParent(arguments);

		this.mon(this.getEl().select('.choice'),{
			scope: this,
			click: this.choiceClicked
		});
	},


	choiceClicked: function(e){
		var c = e.getTarget('.choice',null,true);
		if(!c){return;}

		c.down('.control').toggleCls('checked');
	},


	getSolutionContent: function(part) {
		var choices = this.choices,
			out = [], tpl = this.solTpl;

		Ext.each(part.get('solutions'),function(s){
			var x = s.get('value');
			out.push( tpl.apply( [String.fromCharCode(65+x), choices[x]]) );

		});

		return out.join('');
	}
});
