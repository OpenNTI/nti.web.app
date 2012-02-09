Ext.define( 'NextThought.view.widgets.annotations.QuizResults', {
	extend: 'NextThought.view.widgets.annotations.Annotation',
	requires:[
	],

	constructor: function(record, container, component){
		Ext.apply(this, {
			anchorNode : null,
			renderPriority: 0
		});

		this.callParent([record, container, component,
			'resources/images/charms/note-white.png']);

		this.anchorNode = Ext.get(Ext.query('#nticontent a[name]')[0]);
	},

	attachRecord: function(record){
		this.record = record;
	},

	buildMenu: function(){
		var items = [],
			me = this;

		if(this.isModifiable){
			items.push({
				text : 'Show Results',
				handler: Ext.bind(this.showResults, this)
			});
		}
		return Ext.create('Ext.menu.Menu',{items: items});
	},


	showResults: function() {
		console.log('show results');
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
	}
});
