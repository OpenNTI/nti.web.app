Ext.define( 'NextThought.view.widgets.annotations.Transcript', {
	//extend: 'NextThought.view.widgets.annotations.Note',
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
				text : this.getTitle(),
				handler: Ext.bind(this.openTranscript, this)
			});
		}
		return Ext.create('Ext.menu.Menu',{items: items});
	},

	_createNoteContainer: function(id){
		var i = 'note-container-'+id,
			e = Ext.get(i),
			n = e ? e.dom : this.createElement('div',this._cnt,'document-notes');
		n.setAttribute('id',i);
		return Ext.get(n);
	},

	getTitle: function(){
		var d = Ext.Date.format(this._record.get('Last Modified'), 'M j, Y');

		return  Ext.String.format('Chat Transcript | {0}',d);
	},

	openTranscript: function() {
		if (this._win){this._win.close();}

		var np, it,
			win = this._win = Ext.create('Ext.window.Window', {
			title: this.getTitle(),
			constrain: true,
			autoScroll: true,
			width: 400,
			height: 300,
			modal: true
		});

		np = Ext.widget('note-entry',{  _annotation: this, component: this._cmp });
		np.failedToLoadTranscript = function(){
			win.close();
			alert('Could not load transcript');
		};
		it = np.insertTranscript;
		np.insertTranscript = function(m){
			win.show();
			it.call(np, m, win);
			win.doComponentLayout();
		};

		win.on('destroy', function(){np.destroy();});
		np.fireEvent('load-transcript', this._record, np);
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
			console.error('Non-Chat Anchored Transcript onResize: ',e,e.message, e.stack);
		}
	}
});
