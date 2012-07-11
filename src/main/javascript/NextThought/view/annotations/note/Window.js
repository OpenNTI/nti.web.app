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
		align: 'stretchmax'
	},
	items: [
		{xtype: 'note-filter-bar' },
		{xtype: 'note-carousel' },
		{xtype: 'note-main-view' },
		{xtype: 'note-responses' }
	]
});
