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

	constrain: true,
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

		this.add({ xtype: 'htmleditor', anchor: '100% 100%', enableAlignments: false, value: text });

		this.on('thumbnail-clicked',this.showWhiteboardEditor, this);
	},


	afterRender: function(){
		var me = this,
			editor = me.down('htmleditor');

		me.callParent(arguments);

		editor.getToolbar().add('-',{
			text: 'WB',
			handler: function(){me.insertWhiteboard()}}
		);
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


	getWhiteboardThumbnail: function(canvas, id){

		var whiteboard = this.getWhiteboardEditor(canvas, id).down('whiteboard');

		whiteboard.on('save', this.updateOrCreateWhiteboardThumbnail, this);
		whiteboard.__id = id;

		return whiteboard.getThumbnail();
	},


	getWhiteboardThumbnailClickHandler: function(id){
		return Ext.String.format(
			'onClick="window.top.Ext.getCmp(\'{0}\').fireEvent(\'thumbnail-clicked\',\'{1}\')"',
				Ext.String.trim(this.getId()), id);
	},


	updateOrCreateWhiteboardThumbnail: function(whiteboard){
        //the getDoc() is non-public api
        var id = whiteboard.__id,
            iFrameDoc = this.down('htmleditor').getDoc(),
            body = iFrameDoc.body,
            numShapes = whiteboard.getNumberOfShapes(),
            div = iFrameDoc.getElementById(id);

        //if there's no placeholder, add one:
        if (!div) {
            body.innerHTML += Ext.String.format(AnnotationUtils.NOTE_BODY_DIVIDER, id,
      										Ext.String.format(AnnotationUtils.WHITEBOARD_THUMBNAIL,'',
      												this.getWhiteboardThumbnailClickHandler(id)));
            div = iFrameDoc.getElementById(id)
        }

        //If WB now has 0 elements, just remove it from the editor, otherwise, update thumbnail.
        if (numShapes == 0)
            div.parentNode.removeChild(div);
        else
            div.innerHTML = Ext.String.format(
                    AnnotationUtils.WHITEBOARD_THUMBNAIL,
                    whiteboard.getThumbnail(),
                    this.getWhiteboardThumbnailClickHandler(id));
	},

	insertWhiteboard: function(){
		var id = guidGenerator(),
			win = this.getWhiteboardEditor(null, id),
			whiteboard = win.down('whiteboard'),
			//the getDoc() is non-public api
			iFrameDoc = this.down('htmleditor').getDoc(),
			body = iFrameDoc.body;

		whiteboard.__id = id;
		whiteboard.on('save', this.updateOrCreateWhiteboardThumbnail, this);
		win.show();
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

		var win = this.editors[id] = this.editors[id] || Ext.widget('window', {
			maximizable:true,
			closeAction: 'hide',
			closable: false,
			title: 'Whiteboard',
			width: 500, height: 500,
			modal: true,
			layout: 'fit',
			items: { xtype: 'whiteboard', value: Ext.clone(canvas) },
			bbar: this.getWhiteboardBottomToolbar()
		});

		win.show();
		win.hide();

		win.saveScene = function(){return this.down('whiteboard').saveScene();};

		return win;
	},


	getWhiteboardBottomToolbar: function(){
		var me = this;
		return [
			'->',
			{ xtype: 'button', text: 'Save',
				handler: function(btn){
					var win = btn.up('window').hide(),
                        wb = win.down('whiteboard');
					wb.fireEvent('save',wb);
				}
			},
			{ xtype: 'button', text: 'Cancel',
				handler: function(btn){
					var win = btn.up('window').hide(),
                        wb = win.down('whiteboard');
					wb.reset();
                    wb.fireEvent('cancel',wb);
				}
			}
		];
	},


	getValue: function(){
		var me = this,
			e = this.down('htmleditor'),
			val = e.getValue().replace(/\u200b/g,''),
			body = val.split(/(<div.*?class="body-divider".*?<\/div>)/ig);

		Ext.each(body,function(v,i,a){
			if(v.indexOf('class="body-divider"')<0)return;
			var id = /<div.*?id="(.+?)".*?div>/i.exec(v)[1];
			a[i]=me.editors[id].saveScene();
		});

		return body;
	},

    show: function(){
        this.callParent(arguments);
        var e = this.down('htmleditor');
        setTimeout(function(){e.focus();}, 500);
    }
});
