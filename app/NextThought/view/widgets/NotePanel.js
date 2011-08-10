Ext.define('NextThought.view.widgets.NotePanel',{
	extend : 'Ext.panel.Panel',
	alias: 'widget.notepanel',
	
	cls : 'x-note-panel-cmp',
	layout : 'fit',
	tbar : [
		{ text : 'Edit', isEdit: true }, 
		{ text : 'Delete', isDelete: true }
	],
	html : '<p>&nbsp;</p>'
});
