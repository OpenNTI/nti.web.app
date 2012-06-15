Ext.define( 'NextThought.view.annotations.Transcript', {
	extend: 'NextThought.view.annotations.Annotation',
	alias: 'widget.transcript-annotation',
	requires:[
		'NextThought.cache.IdCache'
	],

	constructor: function(record, component){
		Ext.apply(this, {
			anchorNode : null,
			renderPriority: 3,
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

		var np, it,log,
			win = this.win = Ext.widget({
				xtype:'nti-window',
				title: this.getTitle(),
				cls: 'chat-window',
				disableDragDrop: true,
				constrain: true,
				autoScroll: true,
				width: 400,
				height: 300,
				modal: true,
				layout: 'fit',
				items: [
					{xtype:'chat-log-view'}
				]
			});

		log = win.down('chat-log-view');
		log.fireEvent('load-transcript', this.record, log);
		win.show();
	},

	render: function(){
		try{
			var me = this,
				a = me.anchorNode,
				ox = me.offsets.left+60;

			if ( me.img && a ) {
				ox -= Ext.fly(me.img).getWidth();
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
