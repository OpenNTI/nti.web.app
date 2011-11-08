Ext.define('NextThought.view.windows.NoteEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.noteeditor',
    requires: [
        'Ext.form.field.HtmlEditor',
		'NextThought.view.widgets.draw.Whiteboard'
    ],

	width: '60%',
	height: '40%',
	minWidth: 600,
	minHeight: 500,

	closable: false,
	maximizable:true,
	border: false,
	layout: 'anchor',
	title: 'Edit Note',
	bbar: [
		{ xtype: 'button', text: 'Whiteboard', action:'whiteboard', enableToggle: true },
		'->',
  		{ xtype: 'button', text: 'Save',	action: 'save' },
  		{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
	],
	
	initComponent: function(){
		this.callParent(arguments);

		var body = this.record.get('body'),
			text = body[0],
			canvas = body[1];//in future, use a search to find this instead of assuming its at index 1.

		this.add({ xtype: 'htmleditor', anchor: '100% 100%',	enableAlignments: false,	value: text });
		this.add({ xtype: 'whiteboard', anchor: '100% 80%',		hidden: true, 				value: canvas });

		if(canvas){
			this.on('afterrender', function(){
				this.down('button[action=whiteboard]').toggle(true,true);
				this.toggleWhiteboard(true);
			}, this);
		}
	},


	toggleWhiteboard: function(state){
		this.down('htmleditor').anchor = '100% '+(state? '20%' : '100%');
		this.doLayout();

		var c = this.down('whiteboard');
		(state?c.show:c.hide).call(c);

	},


    show: function(){
        this.callParent(arguments);
        var e = this.down('htmleditor');
        setTimeout(function(){e.focus();}, 500);
    }

});
