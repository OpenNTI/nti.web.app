Ext.define('NextThought.view.annotations.note.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.note-window',

	requires: [
		'NextThought.view.annotations.note.FilterBar',
		'NextThought.view.annotations.note.Carousel',
		'NextThought.view.annotations.note.Main',
		'NextThought.view.annotations.note.Responses',
		'NextThought.view.annotations.note.Reply'
	],

	cls: 'note-window',
	ui: 'note-window',
	minimizable: false,
	closable: true,
	modal: true,
	title: 'Comments',
	width: 670,
	height: '85%',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [
		{xtype: 'note-filter-bar' },
		{xtype: 'note-carousel' },
		{
			noteWindowBody: true,
			xtype: 'container',
			cls: 'note-content-container',
			autoScroll: true,
			flex: 1,
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [
				{xtype: 'note-main-view' },
				{xtype: 'note-responses' }
			]
		}
	],


	initComponent: function(){
		var a = this.annotation;
		this.callParent(arguments);
		this.down('note-main-view').prefix = a.prefix;
		this.down('note-carousel').setRecord(a.getRecord());

		this.syncSize = Ext.Function.createBuffered(this.syncSize,10,this,null);
	},


	syncSize: function(){
		this.callParent(arguments);

		var f = this.query('nti-window-header,note-filter-bar,note-carousel,note-main-view,note-responses');
		if(!f || !f[0].rendered){return;}

		var h = 2;
		Ext.each(f,function(o){h+= o.getHeight(); });

		if(this.getHeight() > h){
			this.setHeight(h);
			this.center();
		}
	},

	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		if(me.isReply) {
			me.down('note-main-view').activateReplyEditor();
		}
		setTimeout(function(){me.syncSize();},1);
	},


	getSearchTerm: function(){
		return this.down('note-filter-bar').down('simpletext').getValue();
	}
});
