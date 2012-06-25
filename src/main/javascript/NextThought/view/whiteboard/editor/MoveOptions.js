Ext.define('NextThought.view.whiteboard.editor.MoveOptions',{
	alias: 'widget.wb-tool-move-options',
	extend: 'Ext.toolbar.Toolbar',
	ui: 'options',

	defaults: {
		ui: 'option',
		scale: 'large'
	},
	items: [

		//These all need to disable until a shape is selected. Then they can enable, but as soon as a shape is de-selected, disable them.

		{ text: 'Send Back'},'-',
		{ text: 'Send Forward'},'-',
		{ text: 'Duplicate'},'-',
		{ text: 'Edit Object'},'-',
		{ text: 'Delete'}
	]
});
