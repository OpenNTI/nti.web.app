Ext.define('NextThought.view.assessment.input.MultipleChoice',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-waitingforName',

	inputTpl: Ext.DomHelper.markup({ cls: 'multi-choice {choice-style}', cn:[{
		tag: 'tpl', 'for': 'choices', cn: [{
			cls: 'choice',
			cn:[
				{ tag: 'span', cls: 'control tabable', tabIndex:'{[xindex-1+parent.tabIndex]}', 'data-index':'{[xindex-1]}'},//xindex is 1 based
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
		var me = this;
		this.callParent(arguments);
		this.choices = (this.part.get('choices')||[]).slice();

		//clean out markup
		Ext.each(this.choices,function(v,i,a){
			a[i] = me.filterHTML(v);
			//console.debug('Choice pruned HTML:',a[i]);
		});

		this.renderData = Ext.apply(this.renderData||{},{
			choices: this.choices,
			'choice-style': 'multi',
			tabIndex: this.tabIndexTracker.getNext(this.choices.length-1)
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.getEl().select('.choice'),{
			scope: this,
			click: this.choiceClicked
		});
	},


	choiceClicked: function(e){
		if(this.submitted){return;}

		var c = e.getTarget('.choice',null,true);
		if(!c){return;}

		c.down('.control').toggleCls('checked');

		if(!this.getEl().query('.control.checked').length){ this.disableSubmission(); }
		else { this.enableSubmission(); }
	},


	getValue: function(){
		var val = [];

		Ext.each(this.getEl().query('.control.checked'),function(e){
			val.push(parseInt(e.getAttribute('data-index'),10));
		});

		return val;
	},


	getSolutionContent: function(part) {
		var choices = this.choices,
			out = [], tpl = this.solTpl;

		Ext.each(part.get('solutions'),function(s){
			var x = s.get('value');
			out.push( tpl.apply( [String.fromCharCode(65+x), choices[x]]) );

		});

		return out.join('');
	},


	mark: function(){
		var c = {};
		Ext.each(this.part.get('solutions'),function(s){c[s.get('value')]=true;});

		this.getEl().select('.choice').removeCls(['correct','incorrect']);

		Ext.each(this.getEl().query('.control.checked'),function(e){
			var x = parseInt(e.getAttribute('data-index'),10);
			var cls = c[x]===true?'correct':'incorrect';

			Ext.fly(e).up('.choice').addCls(cls);
		});
	},


	markCorrect: function(){
		this.callParent();
		this.mark();
	},


	markIncorrect: function(){
		this.callParent();
		this.mark();
	},


	reset: function(){
		this.getEl().select('.choice').removeCls(['correct','incorrect']);
		this.getEl().select('.control').removeCls('checked');
		this.callParent();
	}
});
