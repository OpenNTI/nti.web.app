Ext.define('NextThought.view.annotations.BodyEditor', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.body-editor',


	layout: 'fit',

	requires: [
		'Ext.form.field.HtmlEditor',
		'NextThought.util.AnnotationUtils',
		'NextThought.view.whiteboard.Editor'
	],
	items: [{
		xtype: 'htmleditor',
		enableLists: false,
		enableAlignments: false,
		enableLinks: false,
		enableSourceEdit: false,
		enableFont: false,
		enableFontSize: false
	}],

	constructor: function(config){
		this.editors = {};
		this.thumbs = [];

		config = config || {};

		if (config.showButtons === true) {
			this.dockedItems= {
				dock: 'bottom',
				xtype: 'toolbar',
				items: [
					{ xtype: 'textfield', flex:1,
						value: config.scriptName,
						disabled: config.disabledNameField
					},
					{ text: 'Save', action: 'save' },
					{ text: 'Cancel', action: 'cancel' }
				]
			};
		}

		this.callParent(arguments);
	},

	initComponent: function(){

		var editor = this.items[0];

		Ext.apply(editor,{
			listeners: {
				scope: this,
				initialize:this.hookHtmlEditor
			}
		});

		AnnotationUtils.compileBodyContent(this.record,
			{
				scope: this,
				getThumbnail: this.getWhiteboardThumbnail,
				getClickHandler: this.getWhiteboardThumbnailClickHandler,
				getResult: function(val){
					if(editor.setValue) { editor.setValue(val); }
					else { editor.value = val; }
				}
			},{
				width: 250, onmouseover: null
			}
		);

		this.callParent(arguments);
		this.on('thumbnail-clicked',this.showWhiteboardEditor, this);

		this.on('thumbnail-clicked',this.showWhiteboardEditor, this);
		this.down('htmleditor').on('initialize',this.attachClickHandlers, this);
	},


	hookHtmlEditor: function(){
		var me = this,
			editor = me.down('htmleditor'),
			iFrameDoc = editor.getDoc(),
			id, el;

		function buildCallback(id){
			return function(){ me.fireEvent('thumbnail-clicked',id); };
		}

		function buildHover(css){
			return function(e,el){
				var sel = 'div.body-divider',
					x = Ext.fly(el).is(sel)? Ext.get(el) : Ext.fly(el).up(sel);
				x.setStyle(css);
			};
		}

		editor.getToolbar().add('-');//the layout doesn't work initially with this in one call
		editor.getToolbar().add({ iconCls: 'editor-whiteboard', tooltip: 'Add Whiteboard', handler: function(){me.insertWhiteboard();} },
			{ iconCls: 'editor-seperator', tooltip: 'Add a Seperator', handler: function(){me.insertSeperator();} }
		);

		while(!!(id = this.thumbs.pop()) ) {
			el = iFrameDoc.getElementById(id);
			if(!el){
				console.warn('no el for id:', id);
				continue;
			}
			Ext.fly(el).on('click', buildCallback(id));
			Ext.fly(el).setStyle({cursor:'pointer'});
			Ext.fly(el).on('mouseover',buildHover({ background: '#eeeeee' }));
			Ext.fly(el).on('mouseout', buildHover({ background: 'None' }));
		}

		this.doLayout();
		this.doComponentLayout();
	},

	attachClickHandlers: function(){
		var me = this,
			editor = me.down('htmleditor'),
			iFrameDoc = editor.getDoc(),
			id, el;

		function buildCallback(id){
			return function(){ me.fireEvent('thumbnail-clicked',id); };
		}

		function buildHover(css){
			return function(e,el){
				var sel = 'div.body-divider',
					x = Ext.fly(el).is(sel)? Ext.get(el) : Ext.fly(el).up(sel);
				x.setStyle(css);
			};
		}


		while(!!(id = this.thumbs.pop()) ) {
			el = iFrameDoc.getElementById(id);
			if(!el){
				console.warn('no el for id:', id);
				continue;
			}
			Ext.fly(el).on('click', buildCallback(id));
			Ext.fly(el).setStyle({cursor:'pointer'});
			Ext.fly(el).on('mouseover',buildHover({ background: '#eeeeee' }));
			Ext.fly(el).on('mouseout', buildHover({ background: 'None' }));
		}
	},


	destroy: function(){
		var i;

		for(i in this.editors){
			if(this.editors.hasOwnProperty(i)){
				this.editors[i].destroy();
				delete this.editors[i];
			}
		}

		delete this.editors;

		this.callParent(arguments);
	},


	getWhiteboardThumbnail: function(canvas, id, callback){

		var whiteboard = this.getWhiteboardEditor(canvas, id).down('whiteboard-editor');

		whiteboard.on('save', this.updateOrCreateWhiteboardThumbnail, this);
		whiteboard.$id = id;

		whiteboard.getThumbnail(callback);
	},


	getWhiteboardThumbnailClickHandler: function(id){
		this.thumbs.push(id);
		return '';
	},


	updateOrCreateWhiteboardThumbnail: function(whiteboard){
		//the getDoc() is non-public api
		var id = whiteboard.$id,
			iFrameDoc = this.down('htmleditor').getDoc(),
			body = iFrameDoc.body,
			val = whiteboard.getValue(),
			div = iFrameDoc.getElementById(id);

		//if there's no placeholder, add one:
		if (!div) {
			body.innerHTML += Ext.String.format(
					AnnotationUtils.NOTE_BODY_DIVIDER,
					id,
					Ext.String.format(
							AnnotationUtils.WHITEBOARD_THUMBNAIL,
							'',//no onclick
							this.getWhiteboardThumbnailClickHandler(id),
							'width="250"'
					)
			);
			div = iFrameDoc.getElementById(id);
			this.attachClickHandlers();
		}

		//If WB now has 0 elements, just remove it from the editor, otherwise, update thumbnail.
		if (!val || val.shapeList.length === 0) {
			div.parentNode.removeChild(div);
		}
		else{
			whiteboard.getThumbnail(function(data){
				div.getElementsByTagName('img')[0].setAttribute('src', data);//updating the thumb
			});
		}
	},

	insertWhiteboard: function() {
		var id, win, whiteboard;
		id = guidGenerator();
		win = this.getWhiteboardEditor(null, id);
		whiteboard = win.down('whiteboard-editor');

		whiteboard.$id = id;
		whiteboard.on('save', this.updateOrCreateWhiteboardThumbnail, this);
		win.show();
	},


	insertSeperator: function() {
		//the getDoc() is non-public api
		var iFrameDoc = this.down('htmleditor').getDoc(),
			body = iFrameDoc.body;

		body.innerHTML += AnnotationUtils.SEPERATOR;
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

		var h = Ext.getBody().getHeight()*0.5,
			w = Ext.getBody().getWidth()*0.5,
			win = this.editors[id] = this.editors[id] || Ext.widget('window', {
				maximizable:true,
				closeAction: 'hide',
				closable: false,
				constrain: true,
				title: 'Whiteboard',
				width: w, height: h,
				modal: true,
				layout: 'fit',
				hideMode: 'display',
				items: { xtype: 'whiteboard-editor', value: Ext.clone(canvas) },
				bbar: this.getWhiteboardBottomToolbar()
			});

		win.getValue = function(){
			return !win.rendered? canvas : this.down('whiteboard-editor').getValue();
		};

		return win;
	},


	getWhiteboardBottomToolbar: function() {
		return [
			'->',
			{ xtype:'button', text:'Save',
				handler:function (btn) {
					var win = btn.up('window').hide(),
						wb = win.down('whiteboard-editor');
					wb.initialConfig.value = wb.getValue();
					wb.fireEvent('save', wb);
				}
			},
			{ xtype:'button', text:'Cancel',
				handler:function (btn) {
					var win = btn.up('window').hide();
					win.down('whiteboard-editor').reset();
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
			if(v.indexOf('class="body-divider"')<0){return;}
			var id = /<div.*?id="(.*?)".*?div>/i.exec(v)[1];
			if (id) {a[i]=me.editors[id].getValue();}
			else {a[i]=undefined;}
		});

		return Ext.Array.clean(body);
	}
});
