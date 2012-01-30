Ext.define('NextThought.view.widgets.annotations.BodyEditor', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.body-editor',


	layout: 'anchor',
	enableLists: false,
	enableAlignments: false,

	requires: [
		'Ext.form.field.HtmlEditor',
		'NextThought.util.AnnotationUtils',
		'NextThought.view.widgets.draw.Whiteboard'
	],

	initComponent: function(){
		this.editors = {};
		this.thumbs = [];
		this.callParent(arguments);

		var text = AnnotationUtils.compileBodyContent(this.record, {
			scope: this,
			getThumbnail: this.getWhiteboardThumbnail,
			getClickHandler: this.getWhiteboardThumbnailClickHandler
		});

		if (this.showButtons) {
			this.addDocked([{
				dock: 'bottom',
				xtype: 'toolbar',
				items: [
					{ text: 'Save', action: 'save' },
					{ text: 'Cancel', action: 'cancel' }
				]
			}], 0);
		}

		this.add({ xtype: 'htmleditor', anchor: '100% 100%', enableLists: false, enableAlignments: false, value: text });

		this.on('thumbnail-clicked',this.showWhiteboardEditor, this);

		this.down('htmleditor').on('initialize',this.attachClickHandlers, this);
	},



	afterRender: function(){
		var me = this,
			editor = me.down('htmleditor');


		me.callParent(arguments);

		editor.getToolbar().add('-',
			{
				text: 'WB',
				handler: function(){me.insertWhiteboard();}
			},
			{
				text: 'SEP',
				handler: function(){me.insertSeperator();}
			}
		);
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


	getWhiteboardThumbnail: function(canvas, id){

		var whiteboard = this.getWhiteboardEditor(canvas, id).down('whiteboard');

		whiteboard.on('save', this.updateOrCreateWhiteboardThumbnail, this);
		whiteboard.__id = id;

		return whiteboard.getThumbnail();
	},


	getWhiteboardThumbnailClickHandler: function(id){
		this.thumbs.push(id);
		return '';
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
			div = iFrameDoc.getElementById(id);
			this.attachClickHandlers();
		}

		//If WB now has 0 elements, just remove it from the editor, otherwise, update thumbnail.
		if (numShapes === 0) {
			div.parentNode.removeChild(div);
		}
		else{
			div.innerHTML = Ext.String.format(
				AnnotationUtils.WHITEBOARD_THUMBNAIL,
				whiteboard.getThumbnail(),
				function(){return '';});//updating the thumb
		}
	},

	insertWhiteboard: function() {
		var id, win, whiteboard;
		id = guidGenerator();
		win = this.getWhiteboardEditor(null, id);
		whiteboard = win.down('whiteboard');
		//the getDoc() is non-public api
		//iFrameDoc = this.down('htmleditor').getDoc(),
		//body = iFrameDoc.body;

		whiteboard.__id = id;
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
				items: { xtype: 'whiteboard', value: Ext.clone(canvas) },
				bbar: this.getWhiteboardBottomToolbar()
			});

		win.saveScene = function(){
			return !win.rendered? canvas : this.down('whiteboard').saveScene();
		};

		return win;
	},


	getWhiteboardBottomToolbar: function() {
		return [
			'->',
			{ xtype:'button', text:'Save',
				handler:function (btn) {
					var win = btn.up('window').hide(),
						wb = win.down('whiteboard');
					wb.initialConfig.value = wb.saveScene();
					wb.fireEvent('save', wb);
				}
			},
			{ xtype:'button', text:'Cancel',
				handler:function (btn) {
					var win = btn.up('window').hide(),
						wb = win.down('whiteboard');
					wb.reset();
					wb.fireEvent('cancel', wb);
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
			if (id) {a[i]=me.editors[id].saveScene();}
			else {a[i]='undefined';}
		});

		return Ext.Array.clean(body);
	}
});