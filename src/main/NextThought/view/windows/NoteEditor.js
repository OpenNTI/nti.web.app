Ext.define('NextThought.view.windows.NoteEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.noteeditor',
    requires: [
        'Ext.form.field.HtmlEditor',
		'NextThought.view.widgets.draw.Whiteboard'
    ],

	strTpl:	'<div id="{0}" class="body-divider" style="text-align: left; margin: 10px; padding: 5px;">' +
				'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="250" height="200" ' +
					 'preserveAspectRatio="xMidYMin slice" viewBox="0, 0, 1, 1" ' +
					 'style="border: 1px solid gray" {2}>{1}</svg>' +
			'</div>\u200b',

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

		var body = this.record.get('body'),
			text = [],
			i,o,id;

		for(i in body) {
			if(!body.hasOwnProperty(i)) continue;
			o = body[i];

			if(typeof(o) != 'string'){
				id = guidGenerator();

				var win = this.getWhiteboardEditor(o, id),
					svg = win.down('whiteboard');

				svg.on('save', this.updateWhiteboard, this);

				text.push(
						Ext.String.format(this.strTpl,
								id,
								svg.getThumbnail(),
								Ext.String.format(
									'onClick="window.top.Ext.getCmp(\'{0}\').fireEvent(\'thumbnail-clicked\',\'{1}\')"',
										Ext.String.trim(this.getId()),
										id)
					)
				);

			}
			else
				text.push(o);
		}


		this.add({ xtype: 'htmleditor', anchor: '100% 100%',	enableAlignments: false,	value: text.join('') });

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
