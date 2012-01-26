Ext.define('NextThought.view.windows.NoteEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.noteeditor',
	requires: [
		'NextThought.view.widgets.annotations.BodyEditor'
	],

	width: '600',
	height: '450',

	constrain: true,
	closable: false,
	maximizable:true,
	modal: true,
	border: false,
	layout: 'anchor',
	title: 'Edit Note',
	bbar: [
		'->',
		{ xtype: 'button', text: 'Save',	action: 'save' },
		{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
	],
	
	initComponent: function(){
		this.callParent(arguments);
		this.add({ xtype: 'body-editor',  anchor: '100% 100%', record: this.record });
},


	getValue: function(){
		return this.down('body-editor').getValue();
	},


	show: function(){
		this.callParent(arguments);
		var e = this.down('htmleditor');
		setTimeout(function(){e.focus();}, 500);
	}
});
