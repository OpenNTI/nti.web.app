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
	bbar: ['->',
  		{ xtype: 'button', text: 'Save' },
  		{ xtype: 'button', text: 'Cancel', isCancel: true }
	],
	
	initComponent: function(){
		this.callParent(arguments);
		this.add({ xtype: 'htmleditor', enableAlignments: false, value: this.record.get('text') });
	},

    show: function(){
        this.callParent(arguments);
        var e = this.down('htmleditor');
        setTimeout(function(){e.focus();}, 500);
    }

});
