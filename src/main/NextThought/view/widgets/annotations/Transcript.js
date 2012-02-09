Ext.define( 'NextThought.view.widgets.annotations.Transcript', {
	extend: 'NextThought.view.widgets.annotations.Annotation',
	requires:[
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
			'resources/images/charms/note-white.png']);

		this.anchorNode = Ext.get(Ext.query('#nticontent a[name]')[0]);

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
		var items = [];

		items.push({
			text : this.getTitle(),
			handler: Ext.bind(this.openTranscript, this)
		});

		return Ext.create('Ext.menu.Menu',{items: items});
	},

	getTitle: function(){
		var d = Ext.Date.format(this.record.get('Last Modified'), 'M j, Y');

		return  Ext.String.format('Chat Transcript | {0}',d);
	},

	openTranscript: function() {
		if (this.win){this.win.close();}

		var np, it,
			win = this.win = Ext.create('Ext.window.Window', {
			title: this.getTitle(),
			constrain: true,
			autoScroll: true,
			width: 400,
			height: 300,
			modal: true
		});

		np = Ext.widget('note-entry',{  annotation: this, component: this.ownerCmp });
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
		np.fireEvent('load-transcript', this.record, np);
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
			console.error('Non-Chat Anchored Transcript onResize: ',e,e.message, e.stack);
		}
	}
});
