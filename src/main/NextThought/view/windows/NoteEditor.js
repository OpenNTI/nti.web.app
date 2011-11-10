Ext.define('NextThought.view.windows.NoteEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.noteeditor',
    requires: [
        'Ext.form.field.HtmlEditor',
		'NextThought.util.AnnotationUtils',
		'NextThought.view.widgets.draw.Whiteboard'
    ],

	width: '600',
	height: '450',
	minWidth: 600,
	minHeight: 500,

	closable: false,
	maximizable:true,
	border: false,
	layout: 'anchor',
	title: 'Edit Note',
	bbar: [
		'->',
  		{ xtype: 'button', text: 'Save',	action: 'save' },
  		{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
	],
	
	initComponent: function(){
		this.editors = {};
		this.callParent(arguments);

		var text = AnnotationUtils.compileBodyContent(this.record, {
			scope: this,
			getThumbnail: this.getWhiteboardThumbnail,
			getClickHandler: this.getWhiteboardThumbnailClickHandler
		});

		this.add({ xtype: 'htmleditor', anchor: '100% 100%',	enableAlignments: false,	value: text });

		this.on('thumbnail-clicked',this.showWhiteboardEditor, this);
	},


	destroy: function(){

		for(var i in this.editors){
			if(!this.editors.hasOwnProperty(i)) continue;
			this.editors[i].destroy();
			delete this.editors[i];
		}

		delete this.editors;

		this.callParent(arguments);
	},


	getWhiteboardThumbnail: function(canvas, guid){

		var svg = this.getWhiteboardEditor(canvas, guid).down('whiteboard');

		svg.on('save', this.updateWhiteboard, this);

		return svg.getThumbnail();
	},


	getWhiteboardThumbnailClickHandler: function(guid){
		return Ext.String.format(
			'onClick="window.top.Ext.getCmp(\'{0}\').fireEvent(\'thumbnail-clicked\',\'{1}\')"',
				Ext.String.trim(this.getId()),
				guid);
	},


	showWhiteboardEditor: function(id){
		try{
			this.editors[id].show();
		}
		catch(e){
			console.error(e.message,e.stack,e);
		}
	},

	getWhiteboardEditor: function(canvas, id){

		var win = this.editors[id] = this.editors[id] || Ext.create('Ext.Window', {
			maximizable:true,
			closeAction: 'hide',
			closable: false,
			title: 'Whiteboard',
			width: 500, height: 500,
			modal: true,
			layout: 'fit',
			items: {
				xtype: 'whiteboard', value: Ext.clone(canvas),
				bbar: [
					'->',
					{ xtype: 'button', text: 'Save',	action: 'save' },
					{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
				]
			}
		});

		win.show();
		win.hide();

		return win;
	},


	getValue: function(){
		var body = [];

		var text = this.down('htmleditor').replace(/\u200b/g,'');


		return body;
	},

    show: function(){
        this.callParent(arguments);
        var e = this.down('htmleditor');
        setTimeout(function(){e.focus();}, 500);
    }
});
