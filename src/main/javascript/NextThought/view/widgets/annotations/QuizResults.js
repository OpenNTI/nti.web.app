Ext.define( 'NextThought.view.widgets.annotations.QuizResults', {
	extend: 'NextThought.view.widgets.annotations.Annotation',
	requires:[
		'NextThought.util.QuizUtils',
		'NextThought.cache.IdCache'
	],

	constructor: function(record, container, component){
		Ext.apply(this, {
			id: IdCache.getComponentId(record.getId()),
			anchorNode : null,
			renderPriority: 0,
			win: null,
			isSingleAction: true
		});

		this.callParent([record, container, component,
			'assets/images/charms/quiz-results.png']);

		this.anchorNode = Ext.get(Ext.query('#nticontent')[0]);

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
		QuizUtils.showQuizResult(this.record);
	},

	getTitle: function(){
		var d = Ext.Date.format(this.record.get('Last Modified'), 'M j, Y');
		return  Ext.String.format('Quiz Result | {0}',d);
	},

	render: function(){
		try{
			var me= this,
				p = Ext.get(me.container),
				a = me.anchorNode;

			//move the nib to the top-aligning corner of the note container
			if (me.img){
				Ext.get(me.img).moveTo(p.getLeft(), a.getTop());
			}
		}
		catch(e){
			console.error('QuizResult onResize: ',e,e.message, e.stack);
		}
		this.callParent();
	}
});
