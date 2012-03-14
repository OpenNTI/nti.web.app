Ext.define( 'NextThought.view.widgets.annotations.Transcript', {
	extend: 'NextThought.view.widgets.annotations.Annotation',
	alias: 'widget.transcript-annotation',
	requires:[
		'NextThought.cache.IdCache'
	],

	constructor: function(record, component){
		Ext.apply(this, {
			anchorNode : null,
			renderPriority: 0,
			win: null,
			isSingleAction: true
		});


		this.callParent([record, component]);

		this.anchorNode = Ext.get(this.query('#nticontent a[name]')[0]);

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

		np = Ext.widget('note-entry',{  annotation: this, component: this.ownerCmp, idPrefix: 'win-' });
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
			var me = this,
				a = me.anchorNode,
				ox = me.offsets.left;

			if ( me.img && a ) {
				// If the page is empty of content, there may not be an anchor node
				Ext.get(me.img).setStyle({left: ox+'px', top: a.getTop()+'px'});
			}
		}
		catch(e){
			console.error('Non-Chat Anchored Transcript onResize: ',e,e.message, e.stack);
		}
		this.callParent();
	}
});
