Ext.define('NextThought.view.whiteboard.editor.MoveOptions',{
	alias: 'widget.wb-tool-move-options',
	extend: 'Ext.toolbar.Toolbar',
	ui: 'options',

	defaults: {
		ui: 'option',
		scale: 'large'
	},
	items: [
		{ text: 'Send Back'},'-',
		{ text: 'Send Forward'},'-',
		{ text: 'Duplicate'},'-',
		{ text: 'Edit Object'},'-',
		{ text: 'Delete'}
	]
});
