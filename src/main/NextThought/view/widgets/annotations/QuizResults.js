Ext.define( 'NextThought.view.widgets.annotations.QuizResults', {
	extend: 'NextThought.view.widgets.annotations.Annotation',
	requires:[
	],

	constructor: function(record, container, component){
		Ext.apply(this, {
			_anchorNode : null,
			_renderPriority: 0,
			_win: null
		});

		this.callParent([record, container, component,
			'resources/images/charms/note-white.png']);

		this._anchorNode = Ext.get(Ext.query('#nticontent a[name]')[0]);
	},

	attachRecord: function(record){
		this._record = record;
	},

	_buildMenu: function(){
		var items = [],
			me = this;

		if(this._isMine){
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
				p = Ext.get(me._cnt),
				a = me._anchorNode;

			//move the nib to the top-aligning corner of the note container
			if (me._img){
				Ext.get(me._img).moveTo(p.getLeft(), a.getTop());
			}
		}
		catch(e){
			console.error('QuizResult onResize: ',e,e.message, e.stack);
		}
	}
});
