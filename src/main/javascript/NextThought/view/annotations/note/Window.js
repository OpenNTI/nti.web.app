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
		this.callParent(arguments);
		this.down('note-main-view').setRecord(this.record);
	},

	afterRender: function(){
		this.callParent(arguments);
		if(this.isReply) {
			this.down('note-main-view').activateReplyEditor();
		}
	}
});
