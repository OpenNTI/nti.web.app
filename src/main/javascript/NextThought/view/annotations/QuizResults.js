Ext.define( 'NextThought.view.annotations.QuizResults', {
	extend: 'NextThought.view.annotations.Annotation',
	alias: 'widget.quiz-result-annotation',
	requires:[
		'NextThought.util.QuizUtils',
		'NextThought.cache.IdCache'
	],

	constructor: function(record, component){
		Ext.apply(this, {
			anchorNode : null,
			renderPriority: 2,
			win: null,
			isSingleAction: true
		});

		this.callParent([record, component]);

		this.anchorNode = Ext.get(this.query('#nticontent')[0]);

		Ext.ComponentManager.register(this);
	},

	getItemId: function(){return this.id; },
	isXType: function(){return false;},
	getEl: function(){return this.anchorNode;},

	cleanup: function(){
		Ext.ComponentManager.unregister(this);
		return this.callParent(arguments);
	},

	attachRecord: function(record){
		this.record = record;
	},

	buildMenu: function(){
		var items = [],
			me = this;

		if(this.isModifiable){
			items.push({
				text : this.getTitle(),
				handler: Ext.bind(this.showResults, this)
			});
		}
		return Ext.create('Ext.menu.Menu',{items: items});
	},


	showResults: function(cmp, e) {
		QuizUtils.showQuizResult(this.doc,this.record);
	},

	getTitle: function(){
		var d = Ext.Date.format(this.record.get('Last Modified'), 'M j, Y');
		return  Ext.String.format('Quiz Result | {0}',d);
	},

	render: function(){
		try{
			var me= this,
				a = me.anchorNode,
				ox = me.offsets.left+60;

			if (me.img){
				ox -= Ext.fly(me.img).getWidth()/2;
				Ext.get(me.img).setStyle({left: ox+'px', top: a.getTop()+'px'});
			}
		}
		catch(e){
			console.error('QuizResult onResize: ',e,e.message, e.stack);
		}
		this.callParent();
	}
});
