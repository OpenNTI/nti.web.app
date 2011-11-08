Ext.define('NextThought.view.windows.NoteEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.noteeditor',
    requires: [
        'Ext.form.field.HtmlEditor'
    ],
	
	closable: false,
	maximizable:true,
	border: false,
	layout: 'fit',
	title: 'Edit Note',
	bbar: [
		{ xtype: 'button', text: 'Whiteboard', action:'whiteboard', enableToggle: true },
		'->',
  		{ xtype: 'button', text: 'Save',	action: 'save' },
  		{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
	],
	
	initComponent: function(){
		this.callParent(arguments);
		this.add({ xtype: 'htmleditor', enableAlignments: false, value: this.record.get('body')[0] });
	},

    show: function(){
        this.callParent(arguments);
        var e = this.down('htmleditor');
        setTimeout(function(){e.focus();}, 500);
    }

});
