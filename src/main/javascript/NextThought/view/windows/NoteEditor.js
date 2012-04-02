Ext.define('NextThought.view.windows.NoteEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.noteeditor',
	requires: [
		'NextThought.view.widgets.annotations.BodyEditor'
	],

	constrain: true,
	closable: false,
	maximizable:true,
	modal: true,
	border: false,
	layout: 'anchor',
	title: 'Edit Note',
	bbar: [
		'->',
		{ xtype: 'button', text: 'Discuss',	action: 'discuss' },
		{ xtype: 'button', text: 'Save',	action: 'save' },
		{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
	],
	
	initComponent: function(){
		this.callParent(arguments);
		this.setSize(600,450);
		this.add({ xtype: 'body-editor',  anchor: '100% 100%', record: this.record });
	},


	getValue: function(){
		return this.down('body-editor').getValue();
	},


	show: function(){
		this.callParent(arguments);
		var e = this.down('htmleditor'),
			me = this;
		setTimeout(function(){
			e.focus();
			me.down('toolbar').doComponentLayout();
		}, 500);
	}
});
