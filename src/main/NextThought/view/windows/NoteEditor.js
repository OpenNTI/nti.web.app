Ext.define('NextThought.view.windows.NoteEditor', {
	extend: 'Ext.window.Window',
	alias : 'widget.noteeditor',
    requires: [
        'Ext.form.field.HtmlEditor',
		'NextThought.view.widgets.draw.Whiteboard'
    ],

	strTpl:	'<div id="{0}" style="text-align: center; margin: 10px; border-top: 1px solid black; border-bottom: 1px solid black;">' +
				'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="150" height="100" style="width: 150px; hieght: 100px;"' +
			' preserveAspectRatio="xMidYMin slice" viewBox="0, 0, {1}, {1}"' +
			'>{2}</svg>' +
			'</div>\u200b',

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
		'->',
  		{ xtype: 'button', text: 'Save',	action: 'save' },
  		{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
	],
	
	initComponent: function(){
		this.editors = {};
		this.callParent(arguments);

		var body = this.record.get('body'),
			text = [],
			i,o, id;

		for(i in body) {
			o = body[i];

			if(typeof(o) != 'string'){
				id = guidGenerator();

				var win = this.getWhiteboardEditor(o, id),
					svg = win.el.down('svg'),
					w = svg.getWidth();

				svg = svg.dom.parentNode.innerHTML.replace(/<\/*svg[\s\"\/\-=0-9a-z\:\.\;]*>/gi, '');
				svg = svg.replace(/style=".*?/i, '');
			 	text.push(Ext.String.format(this.strTpl,id,w,svg));

			}
			else
				text.push(o);
		}


		this.add({ xtype: 'htmleditor', anchor: '100% 100%',	enableAlignments: false,	value: text.join('') });

	},


	destroy: function(){

		for(var i in this.editors){
			this.editors[i].destroy();
			delete this.editors[i];
		}

		delete this.editors;

		this.callParent(arguments);
	},


	getWhiteboardEditor: function(canvas, id){

		var win = this.editors[id] = this.editors[id] || Ext.create('Ext.Window', {
			maximizable:true,
			closeAction: 'hide',
			title: 'Whiteboard Test',
			width: 500, height: 500,
			modal: true,
			layout: 'fit',
			items: {xtype: 'whiteboard', value: canvas}
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


	//<div style="border:1px solid black"><svg width="100%"></svg></div>
});
